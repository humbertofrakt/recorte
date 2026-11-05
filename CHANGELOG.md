# Mudanças

Uma seção por versão da especificação. As versões seguem `major.minor` da §2.4:
uma `minor` acrescenta e nunca muda significado; um `major` é uma quebra, e a
§2.4 exige motivo escrito para uma.

---

## [Não publicado]

O rascunho da especificação está aberto. Enquanto ele estiver, o número que os
arquivos gravam (`"version": "1.0"`) é **provisório**: há oito decisões abertas
que mexem em números, e qualquer uma delas fechando diferente do runtime de
hoje tornaria não conformes os arquivos já gravados. Ver `ESTADO.md`,
"Decisões em aberto".

> **As secoes de 22/09 nao estao em ordem numerica, e isso nao e descuido.**
> Cinco chats fecharam dezenove versoes na mesma madrugada, cada um inserindo
> acima do que havia quando comecou a escrever. A ordem aqui e a de **entrada**,
> nao a de numero. Reordenar depois seria reescrever linha de outro chat, e o
> `versao.py` e o `backup/INDICE.md` guardam a ordem real por data e hora.
> Quem procurar uma versao especifica use a busca, nao a posicao.

### v37.0 — a noite de 04 para 05/11/2026: tomadas, guarda-roupa, reaproveitar animação, e o programa achável — 05/11/2026

Palavra do Humberto, 04/11: *"o Claude dizia que programava, mas o que eu pedia não aparecia na tela, não tinha um menu"*. A régua da noite: **o que uma pessoa não faz clicando no que vê não está pronto.** Dez sessões; um relatório por sessão em `documentos/projeto do programa/noite/`, e o resumo em `noite/RESUMO DA NOITE.md`.

- **Tomadas** (antes "Entidades"): ícone de tomada no osso, na cena; botão direito no osso → *Encaixar um projeto…* / *Pôr uma tomada aqui…*; *Este boneco entra em…*; *Mexe junto com a animação de quem segura*; *Animação própria, sempre ligada*. O formato não mudou.
- **Skins → Guarda-roupa: desenho × skin…**: coluna = roupa, linha = desenho; passar o mouse prova a roupa; *+ Nova skin*, *+ Cópia*, *Vestir só esta*.
- **Reaproveitar animação**: *Animação → Animações de outro boneco…* (mostra quantos ossos combinam; Cópia ou Ligadas) e *Base → Seguir o Esqueleto padrão…*.
- **A Oficina**: *Arquivo → Abrir a oficina (exemplo)* e o cartão nas boas-vindas — herói com motosserra, herói na cabine do mecha, três bonecos com as mesmas animações, duas roupas.
- **Achar as coisas**: *Ajuda → Quero fazer…* e o botão no rodapé, com *Mostrar onde*; todo item cinza diz por quê; o dicionário da tela (`ui/jargao.ts`) e o teste de que toda ação tem porta.
- **Recorte na cena (N-4b)**: *Animação → Recorte na cena*, com alças.
- **A tela**: as colunas descem até o rodapé; a linha do tempo fica embaixo da cena. Painéis 92/92 na altura e de lado, com os Detalhes abertos ou fechados. A barra de menus cabe a 1024 px.
- **Salvar sem pasta** baixa um `.bonez` só, com as imagens (antes: sem imagens). **Salvar com outra base em foco** grava cada base no seu arquivo (antes: gravava por cima da principal). O GIF leva o nome da animação.
- **Avisos em português**: as 204 frases do leitor; o rodapé tira o ponteiro JSON.
- **Manual**: reescrito para hoje, sem pausa (o vermelho do manual acabou); capítulo 11, *a espada de um, o boneco de outro*.
- **Formato e runtimes**: o P-002 fechado; casos novos; conformidade **138 de 138** (TS, Python e Construct). O leitor do Godot recebeu o conserto do C-326, sem prova no Godot (fica para a mão).
- **Página na web**: https://humbertofrakt.github.io/recorte/ — o editor, o validador, o visualizador, a spec e o manual; o workflow roda a suíte antes de publicar.
- **Os testes rodam fora do PC do Humberto**: sem o caminho `C:/Users/...`, e os que dependem de `backup/` pulam sem ela.

### v36.5 — a aba que o Humberto circulou; a Árvore do quadro com a chave slot/bone; as sobras dos docs 100 e 101 (rodada 50, lote 4) — 07/10/2026

Rodada 50, lote 4 (doc `98`, itens E e D; docs `100` e `101`).

- **O `×` da aba é um botão, e não uma letra do nome**: caixinha própria, 6 px longe do nome. Era colado no nome, onde o olho procura o ▾ — e um chat, querendo recolher as Propriedades, fechou o painel. O ▾ continua no fim da tira (`ui/shell.css`).
- **A aba à frente não parece sublinhada**: a marca azul subiu da base para o **topo** da aba, como no Photoshop e no VS Code. A altura não mudou (sombra por dentro); a medição continua 90/90 e 83/90.
- **O rodapé concorda**: fala do PAINEL — *"Painel Árvore fechado. Janela → Árvore traz de volta"*, *"Painel Ordem solto…"*, *"Painel Ordem colado neste grupo"*, *"Painel Ordem recolhido"*, *"Grupo recolhido (Árvore, Ordem)"*. Era "Árvore fechado", "Ordem solto".
- **A Árvore do quadro com a chave `slot/bone`** (doc `101`): arrastar `body` para `head` numa animação grava *"body virou filho de head (chave de pai em 0,00 s)"* — uma chave do SLOT, e a Árvore continuava com `body` debaixo de `torso`. Ela lia o osso do desenho no arquivo; agora lê o osso APLICADO do esqueleto vivo (`appliedSlotBones`, em `doc/reparent.ts`), como já fazia com o pai dos ossos. Vale também para o desenho com osso próprio (`shownBone` com o mapa do quadro).
- **"Colar só o que cabe" diz o que ficou de fora** (doc `101`): *"1 chave colada: root em 1,00 s. 1 ficou de fora: passava do fim"*.
- **Reabrir o fechado diz o remédio** (doc `100`): *"… As imagens não vêm no guardado: para trazê-las, Arquivo → Abrir pasta do projeto…"*.
- **A janela do exportar não pula** (doc `100`): ela mora no topo da tela, e não no meio. Trocar o formato mostra e esconde linhas; centrada, a caixa "Só este quadro" andava 23 px. Medido com o mouse: 147 px em GIF, em PNG e em GIF de novo.
- **Exportar e importar skin no menu Skins: não entrou, por uma regra da casa.** A barra de menus não repete ação (o teste do lote 19, "nenhuma ação aparece duas vezes nos doze menus"), e a decisão 5 do Humberto pôs as duas no Arquivo. A porta "no Skins" já existe: na **aba** Skins, os ícones *Importar skin…* e *Exportar skin…*. Desvio escrito para o Diretor.
- 10 testes novos (colunas-e-barra, arvore, arquivo, exportar-e-importar, linha-do-tempo), três reescritos de propósito (as frases "Ordem recolhido", "Ordem aberto" e a sombra do grupo). Reprovado com o mouse (`backup/fotos-obra/rodada-50/lote4/`).

### v36.4 — Ctrl+C copia o quadro; o Ctrl+V que estica pergunta antes e conta tudo (rodada 50, lote 3) — 07/10/2026

Rodada 50, lote 3 (doc `98`, item B11), pelo Spine.

- **Ctrl+C sem chave marcada copia o QUADRO**: a pose do escolhido (o membro inteiro, com os filhos) no tempo da agulha — *"Pose de 0,00 s copiada: N valores do escolhido. Ctrl+V cola na agulha"*. Antes copiava as chaves do membro em TODOS os tempos: em 0 s, Ctrl+A e Ctrl+C levavam as de 0 e as de 0,5, e o Ctrl+V em 1,0 colava as duas, esticando a animação até 1,5 s com a pose girada no fim. Com chave marcada na folha, copia as marcadas, como sempre (`panels/dopesheet-edit.ts`).
- **O Ctrl+V que vai passar do fim pergunta ANTES**: *"O colar passa do fim da animação"* — Colar e esticar · Colar só o que cabe · Cancelar. Ele sabe até onde vai antes de colar (`pasteEnd`), e "só o que cabe" deixa de fora o que passaria (`clipThatFits`).
- **O rodapé do colar conta todas**: *"2 chaves coladas: root em 1,00 · 1,50 s. A animação cresceu de 1,00 s para 1,50 s"* (`pasteDoneNotice`). Antes dizia só as do tempo mais tarde.
- O passo 6 do roteiro (arrastar na Árvore prende sem mover) foi conferido: é a regra da casa, e o rodapé diz *"face virou filho de osso"* (doc `98`).
- 4 testes novos em `linha-do-tempo.test.ts`. Reprovado com o mouse de verdade: copiar o quadro e colar sem esticar; marcar as chaves de 0 e 0,5, colar em 1,0, e a janela perguntar (`backup/fotos-obra/rodada-50/lote3/`).

### v36.3 — "Só este quadro" sai PNG; abrir o herói pergunta antes; o rodapé não diz "salvo" sem salvar (rodada 50, lote 2) — 07/10/2026

Rodada 50, lote 2 (doc `98`, itens A e X).

- **"Só este quadro" leva o formato para PNG.** Marcar a caixa com o GIF escolhido saía um `heroi.gif` de um quadro. Agora a caixa troca GIF, folha e WebM por PNG e guarda o de antes; desmarcada, devolve o de antes (quem trocou de formato no meio, manda). A pose da base, que marca a caixa sozinha, também (`formatoComQuadro`, em `io/export-image.ts`).
- **Uma imagem só sai `heroi.png`**, e não `heroi_0000.png`: o número é de sequência. O rodapé diz "Imagem PNG: 1 quadro de 110x241 … Foi para Downloads".
- **Abrir o herói pergunta antes**, pela janela das mudanças não salvas (Salvar e continuar · Descartar · Cancelar), como as outras portas de abrir desde a rodada 45. Era a única que trocava o trabalho sem perguntar (`main.ts`).
- **O rodapé não diz "Arquivo salvo." sem ter salvado.** O arquivo limpo diz **"Sem mudanças por salvar."** — o herói aberto de dentro do programa dizia "Arquivo salvo." (`ui/salvar-avisos.ts`). Quem acabou de gravar continua lendo "Salvo em …".
- **Reabrir o fechado**: continua sem as imagens, e diz por quê ("As imagens não vêm no guardado"). Fica como estava: a ficha aceita "ou diz por quê".
- 6 testes novos (exportar-e-importar, arquivo), dois reescritos de propósito (o "Arquivo salvo." e o `heroi_0000.png` de um quadro). Reprovado com o mouse de verdade (`backup/fotos-obra/rodada-50/lote2/`).

### v36.2 — o painel solto da parede vem inteiro, e a barra cola onde se solta (rodada 50, lote 1) — 07/10/2026

Rodada 50, lote 1: o que a janela de verdade achou (doc `98`, item C), com o mouse do navegador do aplicativo.

- **A aba solta da parede vinha VAZIA, com uma aba órfã no grupo das Propriedades.** A forma do erro: a casca relê a arrumação guardada a cada montagem, e a releitura (`readIds`, em `ui/layout-model.ts`) só contava as abas dos **grupos** de cada lado. Um painel **solto ou fechado** do lado que não é a casa de fábrica dele (a Ordem levada para a direita e solta de lá) era dado como perdido, e renascia num grupo da outra coluna. Dois donos para o mesmo painel: a aba órfã escondia o corpo da janela solta. Agora a releitura conta também os fechados e os soltos (com as abas do grupo solto).
- **A barra da janela solta voltava sempre ao grupo de origem.** Era a mesma causa: com a aba órfã, o "colar do outro lado" achava a Ordem na coluna errada. Soltar a barra na tira da Árvore cola na Árvore.
- 3 testes novos em `paineis-do-photoshop.test.ts` (vermelhos antes, verdes depois). Reprovado com o mouse de verdade (`backup/fotos-obra/rodada-50/lote1/`).

### v36.1 — a Ordem com três linhas de alvo inteiro em 720; os avisos pelo tipo; o rodapé do exportar diz para onde foi (rodada 48, lote 3) — 07/10/2026

Rodada 48, lote 3 (o Diretor e o doc `95`, a conferência da v35.9).

- **A Ordem em 1280×720 mostra três linhas de 29 px** (a v35.8 punha três, mas de 22 px: alvo apertado). Os px saíram da barra (botões de 28×28 em tela baixa, a medida mínima de alvo) e da ponta "frente", que em tela baixa mora à direita da barra ("FRENTE ↓") e não come linha. Medido no Chrome: barra 33, lista 89, três linhas de 29.
- **Os avisos "imagem não encontrada: NOME" são um tipo só**, com os nomes dentro ("21 × imagem não encontrada: peca0, peca1, … e mais 16"). Eram um tipo por imagem, porque o nome vem sem aspas. A janela de Problemas abre com **um** parágrafo: o das imagens, quando só há elas; o dos tipos, quando há mais.
- **O rodapé do exportar diz para onde foi**: "Foi para Downloads (Ctrl+J mostra)." sem pasta; "Foi para exportar/, na pasta X." com pasta. Antes, só a janela dizia.
- **O Sobre e o LEIA-ME com a versão certa**: a v35.9 e a v36.0 foram montadas sem o número, e diziam a versão anterior. Esta é montada com `montar-programa.py 36.1`.

### v36.0 — soltar uma pasta abre aquela pasta (rodada 48, lote 2) — 07/10/2026

Rodada 48 (o que a mão do Humberto achou), itens 2, 4 e 5.

- **Soltar uma pasta do Explorer na janela abre a pasta como projeto**, sem o seletor do Windows. O arrasto traz a alça da pasta (`getAsFileSystemHandle`, Chrome e Edge); com ela, o caminho é o do Arquivo → Abrir pasta (a pergunta de descartar, o `.bone` da raiz, as imagens na aba Imagens). O rodapé diz: "A pasta mao abriu como projeto, pelo arrasto: 2 imagens na aba Imagens". A pasta de um projeto do Spriter, do Spine ou do DragonBones (sem `.bone` nosso) continua importando, como antes. Sem alça (outro navegador), o caminho de antes.
- Sem a licença de gravar (a alça do arrasto vem só para ler), o rodapé avisa que o Salvar vai pedir licença uma vez.
- Doc `89`: o que funcionou (Novo projeto) e o nome certo do exportar ("GIF, PNG, folha, vídeo…"). Sem pasta, o arquivo sai pelo download do navegador: provado no Chrome sem janela.

### v35.9 — a Cor ao nascer e a Cor na vida se falam; os avisos, o pior primeiro (rodada 48, lote 1) — 07/10/2026

Rodada 48 (o que a mão do Humberto achou, 07/10 de manhã), itens 1, 3 e 6.

- **A barra Cor na vida mostra a cor que se vê.** Em cima, a Cor na vida (a que os losangos editam); embaixo, duas faixas finas: a cor da tela com a Cor ao nascer «de» e com a «a». Trocar a Cor ao nascer muda a barra (antes não mudava). A conta é a do Unity e do Godot, e a da §9.7 da extensão: uma cor **multiplica** a outra. As dicas das duas dizem isso, e onde ver o resultado.
- **Os avisos: os iguais juntos, o pior primeiro.** A barra diz `176 avisos (170 iguais) — ver`; a dica conta os tipos, o pior primeiro (arquivo lido pela metade → algo que some → valor trocado pelo padrão); a lista da barra e a janela de Problemas começam pelo pior, e a janela abre com a conta dos tipos.
- **O "Texto" da chave de evento com dica**, no rótulo e na caixa (doc `93`, defeito 2).
- A Ordem com três linhas em 1280×720 (a outra ressalva do doc `93`) já veio na v35.8: medido de novo, `hand`, `weapon` e `arma` à vista.

### v35.8 — a Ordem mostra três linhas em 1280×720 (rodada 47, lote 6e) — 07/10/2026

Rodada 47, lote 6e (doc `92`, defeito 1).

- **A Ordem em 1280×720 mostra três linhas inteiras** (eram duas na v35.6, uma na v35.5). Abaixo de 800 px de altura, a miniatura tem 20 px, a linha 22 e a ponta "frente" 12. Medido no Chrome, no estado do conferente (herói aberto, nada escolhido): lista de 81 px, e cabem `hand`, `weapon` e a pasta `arma`.

### v35.7 — as Regras dobram, e a Prévia e o evento dizem o que são (rodada 47, lote 6d) — 07/10/2026

Rodada 47, lote 6d: o que faltava do detalhe do conferente sobre o doc `90`.

- **As seções da aba Regras dobram no título** (nota 5): Parâmetros, Regras, Variáveis e Etiquetas. Abre a de Regras, a vazia (curta, diz o que a seção é), a que tem item escolhido e a que tem problema; as outras dobram, e o título diz quantas há ("Variáveis · 2"). A mão manda, por título. A aba não rola mais em 1920×1080 (721 px de conteúdo em 472).
- **A Prévia diz o que é uma camada** (nota 4): na dica do título de cada camada e numa linha dentro da camada 0. A lista do que a cópia deixa de fora fala sem "slot", "morphs" e "tags".
- **O evento diz o que é** (nota 4): o rótulo Evento tem dica ("um aviso com nome que a animação dá ao jogo num instante"); Som, Pasta dos sons e Texto também.

### v35.6 — a ficha completa dobra, e as Curvas sem jargão (rodada 47, lote 6c) — 07/10/2026

Rodada 47, lote 6c, as notas da conferência da v35.4 (doc `90`).

- **A ficha completa dobra os grupos** (nota 5): abre o grupo do nome (o que diz o que é) e o que tem problema; os outros dobram no título, e a mão manda (por título). O Compensar dobra também, e nasce aberto só com alguma caixa ligada. A ficha do osso não rola mais em 1920×1080 (727 px de grupos fixos numa caixa de 472), e a da regra Comando cabe em 1440×900 (rolava 402): **a medição de altura sobe para 83 de 90**.
- **As Curvas sem jargão** (nota 4): os formatos "Passa do alvo" e "Recua e passa" dizem o que fazem, sem citar outro programa; a lista diz "à vista" e "escondida" (era "Vendo" e "Oculta").
- **A Ordem em tela baixa** (nota 1): abaixo de 800 px de altura, a barra e a linha encolhem (miniatura de 28 px). Os 47 px que faltavam eram a barra de botões da Ordem. Três linhas com a ficha inteira embaixo não cabem em 720 (decisão C2: a ficha vence; o ▾ devolve a altura).
- As notas 2 (as setas na barra de velocidade) e 3 (a frase do Copiar) já estavam na v35.5.

### v35.5 — as setas na barra de velocidade, e a frase do Copiar (rodada 47, lote 6b) — 07/10/2026

Rodada 47, lote 6b, as notas da conferência da v35.3 (doc `88`).

- **Com o foco na barra de velocidade do tocador, as setas mexem a barra**, e não a agulha: antes → andava a agulha (0,10 → 0,13 s) e só o PageUp mexia a barra. A folha deixa as setas, PageUp/PageDown, Home e End para a barrinha com o foco (`barKeepsKey`). Provado no montado: 3 setas, a barra de 100 para 103, o tempo parado em 0,00 s.
- A frase debaixo do "Copiar para a linha do tempo" ainda quebrava em duas linhas: agora "Uma chave por quadro", uma linha nas duas telas.
- A dúvida do conferente (o "N avisos — ver" não abre a janela) não se reproduziu: o botão abre a janela de Problemas pelo mesmo caminho do menu; o herói de exemplo não tem aviso para clicar. Fica a pergunta de como ele chegou lá.

### v35.4 — a prova final do padrão dos painéis (rodada 47, lote 6) — 07/10/2026

Rodada 47, lote 6, o último (doc `68`, a prova final e a lista do que ainda rola), com as notas da conferência da v35.2 (doc `87`).

- **A Malha à frente tem chão**, como a ficha e as Animações: o grupo dela cresce até o conteúdo. Mais o nome do desenho na linha do título ("Desenho: face"), o aviso e os títulos dobrados mais baixos e os botões da Forma mais juntos: o conteúdo foi de 510 para 441 px, e **a Malha cabe em 1440×900** (rolava 160). A medição de altura sobe para **82 de 90**.
- **A Montagem da aba Entidades cresce com o conteúdo, e quem rola é a aba** (nota 4 do doc `87`): era uma caixa de 60 px com rolagem própria dentro da rolagem da aba. Duas provas antigas reescritas de propósito.
- **A Ordem não parte pasta**: a peça arrastada entra na pasta onde cai (entre duas da mesma pasta), ou sai da sua; o rodapé diz ("c saiu da pasta cabeca e entrou na pasta braco"). Como no Photoshop. Um passo de desfazer.
- **A barra de avisos e a janela de Problemas contam a mesma lista**, sem frase repetida, e a janela refaz a barra ao abrir (doc `52`, defeito 3).
- As abas da faixa de baixo têm dica; a dica da barrinha da Força diz "em %, de 0 a 100".
- **A prova final**: as 16 abas, no montado, nas duas telas — 0 botão sem dica (eram 15), 3 números sem unidade (eram 18; os 3 não têm grandeza), e a lista do que ainda rola, painel por painel, no doc `68`.

### v35.3 — o clique leva o foco à barrinha, e as dicas que faltavam (rodada 47, lote 5b) — 07/10/2026

Rodada 47, lote 5b, as notas da conferência da v35.1 (doc `86`).

- **O clique na barrinha leva o foco a ela** (nota 1): um ouvinte de painel segurava o padrão do ponteiro, o valor mudava com o foco no BODY, e a seta seguinte (ou o Tab, que esconde os painéis) ia para a casca. Agora a casca dá o foco à barrinha apertada, na captura, e, se o redesenho o larga no BODY ao soltar, ele volta à barrinha de mesma marca. Provado no montado: clique na Força da regra (50), 3 teclas → 53, o foco na barrinha.
- **Dicas que faltavam** (nota 4): as abas da coluna (os gestos delas), as linhas de animação, as linhas da lista das Curvas, "Nenhum aviso", Cor do osso, Ícone, Cor do fundo, a busca de imagem, e Animação, Repetir, Velocidade e Todos os ossos da Prévia.
- A frase debaixo do "Copiar para a linha do tempo" era um parágrafo de três linhas: agora uma ("Vira animação nova, uma chave por quadro"); a inteira está na dica do botão.

### v35.2 — os que não cabiam, e as notas do doc 85 (rodada 47, lote 5) — 07/10/2026

Rodada 47, lote 5 (doc `68`, R9, R11, R13; a opção A do Diretor para 1280×720), com as notas da conferência da v35.0 (doc `85`).

- **A Malha abre a seção da ferramenta na mão**: Forma, Ossos e Pesos viram dobras (o título é o botão). Com a Malha, a Forma; com os Pesos, Ossos e Pesos; com o modo Ligar aberto, os Ossos. A mão vence até a ferramenta mudar. Em 1920 a aba tinha 857 px de texto fixo (rolava 385); com a Forma aberta, 510. **Um clique a mais** para quem vai ligar ossos com o Transformar na mão (abrir a dobra dos Ossos); a prova dos pesos ganhou esse clique, e segue 14 de 14.
- O aviso azul da Malha cabe sem "…": "Forma e pesos gravam na base"; a frase inteira na dica.
- **O Colar espelhado mora ao lado do Colar**, no menu Editar (nota do doc `54`); saiu do submenu Pose.
- **"Imagem" duas vezes** na ficha de um desenho: a do arquivo agora se chama **Arquivo**.
- **A Cebola legível** (nota 1 do doc `85`): o texto saía cinza-claro sobre branco (contraste 1,3:1); agora nas cores da casa. **Com unidade** (nota 2): Passo em s, Para o lado e Para cima em px, Quanto aparece em % (de 0 a 100); cada número com dica e faixa, o número da casa e o rótulo que arrasta.
- **A Prévia** (nota 3): o rótulo da Mistura arrasta o número; as barras "Quanto aparece" têm dica com a faixa.
- **A ficha do osso diz a faixa em toda dica** (nota 4): posição, comprimento, escala, ângulo, inclinação, largura e altura, "de X a Y" (+∞ no que não tem fim).

### v35.1 — a barrinha anda a cada tecla, e todo botão tem dica (rodada 47, lote 4) — 07/10/2026

Rodada 47, lote 4 (doc `68`, régua R5, R8, R9, R10), com as notas do doc `82`.

- **A barrinha mexida pelo teclado anda a cada tecla.** Gravar redesenhava o painel, e a barrinha com o foco sumia: três teclas andavam uma casa (medido na Regra e no Alfa da ficha). O conserto é o do Ctrl+seta da Ordem, num lugar só (`lembrarFoco`, em `panels/dom.ts`), nas Regras (Força e parâmetro), nas Propriedades (Alfa, opacidade da cor) e no Pincel da Malha.
- **Todo botão tem dica**: Voltar ao padrão e Editar aqui (Exibição), Copiar para a linha do tempo (Prévia), Ajustar e Mostrar todas (Curvas), Chavear evento e Apagar esta chave (o apagado diz por quê). Palavra continua palavra onde o desenho não é universal (a regra da casa em `preview.ts`).
- **As Curvas falam no rodapé**: Ajustar diz de quanto a quanto o gráfico vai; Mostrar todas, quantas linhas voltaram.
- **Uma linha de ajuda por painel**: Histórico e Prévia dizem numa linha; a frase inteira fica na dica.
- **O nome da regra inteiro**: a barra da força das Regras foi de 64 para 44 px, e "hair_physics" e "cape_follow" não saem mais cortados.
- **O rodapé do gesto diz que a regra manda** (nota a do doc `82`): girar o braço preso pela IK dizia "Girar 26,3°" como se tivesse girado; agora "… (a regra ik_arm manda nele)". Só a regra que segura A PARTE do gesto: a IK gira o braço mas não o tira do lugar, e o Mover não leva a etiqueta. Três provas antigas reescritas de propósito.
- **Somar pela Árvore fala como pela cena** (nota b do doc `82`): Ctrl e Shift na Árvore dizem "2 escolhidos: torso, body".

### v35.0 — o número da casa fora da ficha (rodada 47, lote 3) — 07/10/2026

Rodada 47, lote 3 (doc `68`, régua R7), com as notas da conferência da v34.9 (doc `84`).

- **Um número só na casa**: `panels/campo-numero.ts` é o número da ficha para quem não é a ficha — conta (`90+15`, `*2`), setas (Shift dez, Alt um décimo), arrasto pelo rótulo, a unidade depois da caixa, e "abc" que fala no rodapé sem apagar o valor. As contas são as da ficha, não uma cópia.
- **Entra na Malha** (Afastamento, Raio, Força do Pincel, Peso exato), na **Mistura da Prévia** (em s), na **chave de evento** (Inteiro, Decimal, Volume e Balanço com dica; volume e balanço em %) e nas caixas da **cebola**. Nenhuma caixa `type=number` crua nesses painéis.
- **Empurrar e Deslocar não fecham a janela com o texto errado**: o botão fica cinza e a frase diz como escrever (nota do doc `54`).
- **A régua da faixa, inteira**: toda dica com unidade diz "de X a Y"; o que não tem fim diz +∞ (Somar X, Posição da base, Espaço, Limite).
- **O número fica na faixa**: arrastar o rótulo da Força (0 a 100 %) passava a 140; agora trava, no arrasto, nas setas e na conta.
- **Os números do Comando** (look_driver): "Em −1", "Em 0", "Em 1" com a unidade da propriedade que ele mexe (° no giro, px na posição, × na escala); o rótulo antigo quebrava em três linhas. Alvo que não é osso (o "weight" de uma deformação) fica sem unidade: a régua não a conhece, e não chuta. Uma prova antiga reescrita de propósito.
- **O zoom da cena faz conta** ("200*2", "+50") e **anda com as setas** (10 %, Shift 50 %).
- Fica como estava (exceção R2 do `68`): Força da mola, Massa, Vento e Gravidade da física não têm unidade na especificação (§6.5); a dica diz a faixa e o típico.

### v34.9 — todo número da ficha diz a unidade e a dica (rodada 47, lote 2) — 07/10/2026

Rodada 47, lote 2 (doc `68`, régua R1 a R4 e R7).

- **Todo número das regras, da física, da base e do ponto diz a unidade, depois da caixa, e tem dica** no molde da casa: *nome, em unidade, de X a Y: o que faz. Típico: …*. A tabela mora num lugar só, `panels/regua-numeros.ts`, com as frases tiradas da especificação (§3.5, §6.2 a §6.5).
- **O que é de 0 a 1 no arquivo aparece de 0 a 100 %** na tela: a força das regras, a inércia, o amortecimento, o quanto da física vai para cada parte, a espessura do anel e o "para fora" das partículas. O arquivo continua de 0 a 1.
- **Todo número da ficha se arrasta pelo rótulo**, com ou sem unidade (antes, só os que tinham unidade).
- **As partículas: a unidade saiu do rótulo** ("Vida (s)" → "Vida … s"; "Raio (px)" → "Raio … px"). Numa faixa, a unidade vem uma vez depois das duas caixas; num par de unidades diferentes (Explosão % · Janela s), ao lado de cada uma. 15 provas antigas reescritas de propósito, com a marca.
- O giro da física tinha passo 1 num campo de 0 a 1: um pixel de arrasto ia ao máximo. Agora 1 %.
- "Quadros por segundo" e "Passos por segundo" quebravam em duas linhas: "Quadros … /s" e "Passos … /s".
- Na ficha do emissor, a Taxa é "Taxa … /s" (o rótulo não repete o "por segundo"), e a unidade depois da caixa não sai mais cortada na borda (a linha da aba ganhou o respiro de 12 px das outras fichas).
- A dica do ▾ que recolhe um grupo diz para quem vai a altura: *"Recolher: Propriedades. A altura vai para Árvore, Ordem"* (decisão do Diretor sobre o C2 do `68`).

### v34.8 — a casca deixa o painel caber (rodada 47, lote 1) — 07/10/2026

Rodada 47, lote 1 (doc `68`, §3): o padrão dos painéis começa pela casca.

- **As abas de um grupo ficam numa fileira só.** O grupo de cima da direita (oito abas) quebrava em três fileiras, 103 px; agora 37. As abas que não cabem moram no **»**, com os nomes na dica; a aba à frente está sempre à vista. Puro em `ui/tab-strip-model.ts`.
- **As abas da faixa de baixo (Linha do tempo · Curvas) moram na linha do tocador**, e não numa fileira própria. Com os Detalhes abertos a folha mostra uma linha de chave a mais: em 1280×720 de 0 para 1, em 1920×1080 de 3 para 4.
- **O rodapé não corta com "…".** Cada parte tem versões curtas (a frase inteira, a primeira frase, o nome antes dos dois-pontos); à vista vai a mais longa que cabe, e a dica guarda a inteira. Em tela estreita o chip diz só "Animação: idle"; a explicação fica na dica.
- Desvio: o chão de 3 linhas para a Árvore em 720 saiu do lote: a ficha rápida inteira e 3 linhas não cabem juntas em 397 px, e o fixo vence (doc `68`, Desvios).

### v34.7 — o herói se deixa posar, e a prova final da Cena (rodada 46, lote 5) — 07/10/2026

Rodada 46, lote 5 (doc `66`), o último, com as notas da conferência da v34.5 (doc `80`).

- **O herói abre ajustado à cena** (278% em 1920×1080). Antes abria a 100%, com 140 px de altura.
- **O osso preso por regra ganha a porta**: ao soltar, o rodapé diz que a regra manda nele e **a aba Regras vem para a frente**, com o olho da regra a um clique.
- **A Ficha rápida mostra a Inclinação X e Y**, em °, quando não é zero.
- **Em tela pequena a caixa do zoom encolhe**: 176×42 px em 1280×720 (era 225×60).
- **B com um osso escolhido à mão junto dos desenhos nasce nele** (nota a): "O osso "cape_lower" nasceu filho de arm". Só o osso de carona do desenho clicado (o de mesmo nome) não conta. Ponto e Caixa seguem a mesma regra.
- **O nome do osso novo é o do primeiro desenho escolhido**, e a dica do Criar osso diz isso (nota b).
- **Osso e desenho somados: o rodapé fala dos dois**: "2 escolhidos: arm, cape_lower" (nota d). Ponto e Caixa num slot dizem "entrou no slot …" (nota c, travado por teste).
- **A prova final** (doc `66`, fim): o objetivo inteiro — posar com o Transformar, B com dois desenhos, P, ponto e caixa — em **20 gestos**, com número e unidade durante cada arrasto. Na parte 1: ~29 gestos e 9 tropeços.
- O erro de `tsc` relatado na v34.6 (`ferramentas.test.ts`, dono rodada 46) foi consertado às 03:20.
- Testes: +8 em `ferramentas.test.ts`.

### v34.6 — os quatro da prova final (rodada 45, lote 6) — 07/10/2026

Rodada 45, lote 6 (doc `78`): Arquivo, exportar e importar.

- **Esc na pergunta "A pasta tem 2 arquivos .bone" cancela**, como nas outras janelas. A pergunta agora vem antes de mudar qualquer coisa e tem Cancelar; antes, o Esc valia "começar vazio" e trocava o personagem aberto por um projeto vazio.
- **O `.bone` da pasta aberta abre pela pasta, com as imagens.** O Ctrl+O e o arrasto traziam só o arquivo escolhido; o atlas estava na pasta e não era lido, e o aviso dizia que ele não estava lá — falso.
- **A janela de avisos recolhe também as linhas curtas** ("imagem não encontrada: X"): o resumo fica, as linhas uma por uma ficam embaixo.
- **Abrir recente lista as pastas primeiro**: o projeto antes do `.bone` solto, que abre sem as imagens.
- Testes: +4 em `arquivo`.

### v34.5 — escolher, criar e ver (rodada 46, lote 4) — 07/10/2026

Rodada 46, lote 4 (doc `66`), com as notas das conferências das v34.1 e v34.2 (docs `76` e `77`).

- **Ctrl+clique soma**, como no Spine; o Shift continua. O rodapé diz quantos e quais: "2 escolhidos: cape_lower, hair".
- **Espaço segurado com o foco em outro painel move a vista** com o mouse sobre a cena. Antes, com o foco na Árvore, o arrasto virava retângulo e desmarcava o escolhido.
- **O osso do B diz onde nasceu**: "O osso "cape_lower" nasceu solto, na raiz" (ou "filho de torso"), e pegando desenhos ganha o nome do primeiro (Spine). **Onde ele nasce não mudou**: a regra do Humberto de 13/09 ("não quero parentesco sem eu ter selecionado antes") fica.
- **Ponto e Caixa que caem na raiz com um desenho escolhido ensinam**: "Ficou solta, na raiz: para pôr num osso, escolha o osso antes".
- **A régua diz onde está o ponteiro**: "X 122 · Y 189 px", ao lado do traço.
- **O zoom pelo teclado e pelo menu diz o %**: "Zoom: 278%".
- Notas: a dica do Inclinar diz "Arraste o osso escolhido…"; a frase do Alt nos lados diz "este lado anda" (não "topo e base"); o rodapé do Criar osso é curto e cabe em 1920; "perto do pivô" só quando um eixo fica parado.
- **Fica para a rodada 47**: em 1280×720 o rodapé divide a largura pelo tamanho do texto, e o estado e a ferramenta cortam.
- Testes: +7 em `ferramentas.test.ts`; um em `inclinar.test.ts` mudou de propósito (a dica do Inclinar).

### v34.4 — a skin importada não perde o rosto, e caber no lugar da antiga (rodada 44, lote 7) — 07/10/2026

Rodada 44, lote 7 (doc `55`): a prova final refeita (doc `75`).

- **A skin importada não perde mais o rosto**: o rosto do herói é uma malha com pesos em `head` e `neck`. O `binding.bones` conta na lista de ossos do **arquivo** da skin (apêndice C, regra 8), e a exportação levava os números do corpo num arquivo que só tem o `root`: na volta, todo osso ia para o índice 0 e o rosto saía da cabeça. Agora a exportação leva os ossos que os pesos usam, pelo nome, e renumera por eles. E o aviso dos pesos (RIG_UNMET… do binding), que a frase do Importar engolia, aparece.
- **O rodapé da imagem trocada é curto**: "weapon: entrou no tamanho dela, 1275 × 1027 px. Para caber: Imagens → Caber no lugar da antiga".
- **Caber no lugar da antiga** (ação nova, menu Imagens e grade): ao trocar, o programa guarda o tamanho do desenho que saiu, imagem ou entidade; o Caber muda a escala do novo para o lado maior ficar igual. Um passo de desfazer; vale na base.
- Testes: +3 em `peles`; o bloco do tamanho em `grade-de-imagens` reescrito; as contagens fixas de ações em `acoes` e `existir-nao-e-funcionar` +1.

### v34.3 — a prova final do Arquivo (rodada 45, lote 5) — 06/10/2026

Rodada 45, lote 5 (doc `57`; os pequenos dos docs `72` e `74`): Arquivo, exportar e importar.

- **O importador do Spriter casa as timelines pelo NOME, como o Spriter.** O número de uma timeline vale dentro da animação; no `bcp.scml`, 34 dos 35 números apontavam peças diferentes em animações diferentes, e as chaves de uma peça caíam em outra. Os avisos do `bcp` caíram de 28 para 2; as "trocas de pai e de osso", de 27 para 0.
- **A peça que uma animação do Spriter não usa fica vazia nela**, como no Spriter (a metralhadora não aparece mais no "andarfaca").
- **A pose da base se exporta**: "A base (pose de repouso)" na janela Exportar imagem. Um projeto sem animação dizia "não tem animação nenhuma para exportar".
- **Abrir o herói não herda a pasta do projeto de antes**: o Ctrl+S gravava `heroi.bone` dentro dela, calado.
- **Mudanças não salvas: a janela do programa**, com Salvar e continuar / Descartar / Cancelar, no lugar da caixa do navegador (7 lugares). Cancelar diz no rodapé que nada mudou.
- **O "•" some quando o Ctrl+Z volta ao ponto salvo**, e volta com o Ctrl+Y.
- Problemas do arquivo: com o resumo das imagens, as linhas uma por uma ficam recolhidas. Ctrl+O com a pasta aberta nomeia a pasta. O relatório da exportação diz o nome gravado ("heroi_0000 (2).png"). O relatório do importar põe o nome na frase ("O osso "bone_000" (e mais 9: …)").
- Testes: +3 em `importar` (ferramentas), +9 em `arquivo`, +3 em `exportar-e-importar`.

### v34.2 — a caixa do osso dá controle (rodada 46, lote 3) — 06/10/2026

Rodada 46, lote 3 (doc `66`), com as três notas da conferência da v33.8 (doc `73`).

- **A caixa de um osso ficou mais larga**: meia largura de 16 px de tela (era 10). Os quadradinhos do meio ficam a 32 px um do outro, e a bolinha não encosta neles.
- **O meio do lado escala devagar**: a distância de partida nunca vale menos que 32 px de tela. 20 px de mouse dão × 1,62 (antes 3,03).
- **A escala livre não explode perto do pivô** (nota a): um eixo que parte a menos de 4 px da linha do pivô fica parado, e o rodapé diz "perto do pivô a escala anda devagar, ou o eixo fica parado". Antes: "× −79".
- **Alt no meio do lado inclina nos eixos da caixa**, que gira com o osso. Antes era no mundo, e num osso em pé o arrasto ao longo do lado dava 0°. Puxar para fora agora diz: "Inclinar X 0°: puxe ao longo do lado, não para fora".
- **Um clique rente à caixa de um osso** (até meio quadradinho fora) ainda é dentro: arrasta o osso, não faz retângulo.
- **As setas dizem o sentido** (nota b): "Andar 10 px para a esquerda com o osso".
- **O giro diz que o ângulo é local** (nota c): "Girar −22,1° (agora 67,9° local)".
- Testes: +7 em `ferramentas.test.ts`; três mudaram de propósito (as frases do giro e das setas).

### v34.1 — toda ferramenta se explica (rodada 46, lote 2) — 06/10/2026

Rodada 46, lote 2 (doc `66`): a Cena e as ferramentas.

- **As 12 dicas da barra dizem o gesto e as teclas**, depois do nome e da letra. Eram 3 de 12; as outras nove diziam só "Mover (W)". Ponto e Caixa dizem **"Alt + arrastar"** na dica, não só no rodapé.
- **As 7 ferramentas caladas falam no rodapé** ao serem pegas: Transformar, Selecionar, Mover, Girar, Escalar, Malha e Pesos. A frase diz o que a ferramenta é e o Shift ou o Ctrl dela.
- **Alt sobre o meio de um lado troca o cursor** para o de inclinar (`col-resize` quando o topo anda de lado, `row-resize` quando um lado sobe), e o rodapé ensina uma vez: "Alt: este quadradinho inclina…". Canto com Alt continua escalando.
- **O botão do meio mostra a mão** enquanto arrasta a vista, como o Espaço, e a mão vence o cursor da caixa embaixo dela.
- Testes: +5 em `ferramentas.test.ts`. Mudaram de propósito: 2 em `inclinar.test.ts` e 1 em `cena.test.ts` ("sem enfeite" virou "com o gesto"), e **uma linha de `colunas-e-barra.test.ts`** (parte da casca, com o sim do Diretor): "o Mover não põe linha no rodapé" virou "diz Shift trava um eixo".

### v34.0 — a prova final conferida, e a imagem trocada no tamanho dela (rodada 44, lote 6) — 06/10/2026

Rodada 44, lote 6 (doc `55`): a conferência da prova final (doc `71`). O lote já viajou na v33.9, que fechou com ele no disco.

- **A pasta da "Fazer a skin de uma pasta" é uma lista**: o campo de texto vinha "armadura" sem seleção, digitar dava "armadurainverno" e a janela fechava com erro. A de partida é a primeira pasta que ainda não é skin.
- **Importar skin veste**: a skin entra no topo de Ativas, no mesmo passo de desfazer, e o rodapé diz "está vestida, no topo de Ativas". O lápis fica onde estava.
- **Trocar pasta de origem não promete desfazer**: a dica dizia "Um só desfazer"; agora diz que as trocas de imagem voltam com Ctrl+Z e a pasta não, e o rodapé ensina a voltar.
- **A laranja da grade escrita**: "Laranja: a de agora".
- **O tamanho da imagem trocada** (suposição S5, pelo Spriter e pelo Spine): ela entra no tamanho dela, e o rodapé diz quando muda mais que o dobro — "Ela entra no tamanho dela, 1275 × 1027 px, como no Spriter e no Spine: para caber, mude a Escala na ficha".
- Testes: +3 em `peles`, +2 em `grade-de-imagens`, +1 em `pasta-do-projeto` (já contados na v33.9).

### v33.9 — abrir, soltar e voltar falam claro (rodada 45, lote 4) — 06/10/2026

Rodada 45, lote 4 (doc `57`; os quatro pequenos do doc `64`): Arquivo, exportar e importar.

- **Abrir pasta vazia pergunta** antes de trocar o personagem aberto por um projeto vazio: "A pasta … está vazia", Abrir a pasta vazia / Deixar como está.
- **Salvar como…, com o projeto numa pasta, pergunta**: "Numa pasta nova…" leva o `.bone`, o atlas, as páginas, as entidades e o manifesto, como o "Save as" do Spriter; "Só o arquivo .bone…" faz como antes.
- **A pasta com um `.bone` sem manifesto abre o `.bone`**, mesmo que o programa não a lembre; com mais de um, pergunta qual.
- **Abrir o `.bonez` diz o que veio dentro**: "Pacote heroi.bonez aberto, com a entidade espada.bone e o atlas com as imagens dentro."
- **Problemas do arquivo abre com as imagens que faltam numa linha só**, com a conta e os nomes; as linhas uma por uma ficam embaixo, com o "Trocar imagem…" de cada desenho. O `.bone` solto com a pasta aberta diz a pasta, em vez de mandar abrir uma.
- **O glTF diz o que deixa de fora em palavras de usuário**: uma linha por animação, sem número de seção, sem "slot", "attachment", "constraint" nem "tint black".
- **Toda linha do menu Arquivo tem dica própria** (antes, 11 de 29 sem).
- **O nome do arquivo e o "•" na aba do navegador**, como no Photoshop e no Spine; o rodapé cortado em "…" guarda a frase inteira na dica.
- Entregar uma base não diz a mesma frase duas vezes.
- Testes: +11 em `arquivo`.
- Pela conferência da v33.5 (doc `70`), na janela Exportar imagem: **todo número diz a unidade no rótulo** ("Velocidade (quadros/s)", "Cores do GIF (n.º)", "Repetições do GIF (vezes)"); **o ".zip" some** quando sai uma imagem só; **exportar de novo não regrava calado**: o arquivo novo ganha um número (`heroi_0000 (2).png`), e o aviso diz.

### v33.8 — o número durante o gesto (rodada 46, lote 1) — 06/10/2026

Rodada 46, lote 1 (doc `66`): a Cena e as ferramentas.

- **O rodapé fala com o botão apertado.** Antes ele ficava mudo até soltar: com a mão embaixo, a cena refaz a pose a cada quadro, e cada quadro mandava uma mudança sem nome que apagava o recado. Agora o quadro leva o recado junto (`repose(label?)`, parâmetro opcional no contrato e no documento).
- **O número com a unidade**: "Mover X −12 px · Y −33 px" (os campos X e Y da ficha), "Girar 53,8° (agora −31,2°)", "Escalar X × 1,4", "Inclinar Y 21,6° (agora 21,6°)". Antes: "Mover", sem quanto, e "Escalar X 1,4", sem o ×.
- **Mover, Girar, Escalar e Inclinar sozinhos (W, E, R, Z) dizem a mesma frase** que o Transformar. Com o Transformar, uma frase por movimento, não duas.
- **As setas dizem quanto**: o passo de desfazer é "Andar 10 px com o osso" (ou "com o desenho").
- Testes: +6 em `ferramentas.test.ts`; o teste velho das frases ("Mover", "Escalar X 1,4") mudou de propósito.

### v33.7 — importar do Spriter pela pasta (rodada 45, lote 3) — 06/10/2026

Rodada 45, lote 3 (doc `57`): Arquivo, exportar e importar.

- **Importar → De outro programa… pede a PASTA do projeto**, como o Spriter, que procura as imagens a partir da raiz. O seletor de arquivos não alcançava as 13 subpastas do `exemplo/game`: entravam 2 de 88 imagens. Agora entram 87 de 88 (a que falta não está na pasta).
- **Pasta com mais de um projeto na raiz pergunta qual**: "Qual projeto abrir?", com o `.scml` e o `.scon` lado a lado.
- **O relatório do importar em palavras de usuário**: as linhas que só mudam no nome viram uma, com a conta e os nomes ("10 vezes: O osso "…" troca de pai…"); sem número de seção, sem "timeline". O `exemplo/game` dava 28 linhas; agora 3.
- **O projeto importado mora na pasta escolhida**: o Salvar grava `bcp.bone`, o atlas e as páginas ao lado do `.scml`, sem tocar nele.
- O rodapé das imagens que faltam diz onde pôr e o Recarregar, em vez de mandar soltar a pasta que já veio; "Falta 1" no singular.
- Dica em De outro programa…, PSD… e PSD com ossos….
- Testes: +7 em `exportar-e-importar`.

### v33.6 — a pele de inverno de uma pasta, e a prova final (rodada 44, lote 5) — 06/10/2026

Rodada 44, lote 5 (doc `55`), a prova final do objetivo, e as notas das conferências das v32.7, v33.0 e v33.3 (docs `60`, `63`, `67`). Parte do lote 5 já viajou na v33.4 e na v33.5, que fecharam com ele no disco.

- **A pele de uma pasta enxerga a pasta**: "Fazer a skin de uma pasta" listava só as pastas de imagens já num atlas, e a `inverno/` da aba Imagens não aparecia. Agora a roupa inteira de inverno se faz num gesto ("A pasta "inverno" cobre 8 desenhos; 12 continuam os de baixo").
- **Mesmo nome em outra pasta é outro arquivo** (doc `60`): Trocar pasta de origem para uma pasta de mesmos nomes e outras cores deixava a cena igual e dizia "mesmo lugar". As imagens da pasta mostram as de lá; as de um atlas salvo continuam, e o rodapé diz quais; o rodapé diz quais não existem lá, e conta como novas só as que a pasta de antes não tinha.
- **O Exportar skin diz o que leva**: "exige de quem a usar 8 ossos e 8 slots com estes mesmos nomes" (era "6 nomes"), e avisa as imagens soltas que não vão junto. "slot(s)" virou o plural certo.
- **O pivô** (doc `63`): "abc" no campo não grava calado — a janela fica e diz como escrever; a grade de Pivôs traz o tamanho em px ao lado do pivô; o aviso da raiz numa linha.
- **A aba Skins** (doc `67`): a ajuda curta cabe inteira ("Skin é uma roupa: o desenho troca"), a frase toda na dica; a skin nova pede o nome ANTES de nascer, com o proposto selecionado, e Esc não cria nada; na grade, as entidades ganham cabeçalho, e a laranja é dita "a de agora".
- **A prova final do objetivo** (doc `55`): trocar a espada pelo machado, digitar o pivô, fazer a pele de inverno de uma pasta, desligar, ligar pelo olho, exportar, apagar, importar, ligar — ~22 cliques, só pela tela.

### v33.5 — exportar a pose, com a janela que cabe (rodada 45, lote 2) — 06/10/2026

Rodada 45, lote 2 (doc `57`): Arquivo, exportar e importar.

- **Só este quadro**, na janela Exportar imagem: uma imagem só, a pose no segundo da agulha. Antes a pose de agora só saía com o truque de "Até 0,03 s", e "De 0 até 0" era recusado.
- **Margem (px)**, de 0 a 64: o espaço vazio em volta do desenho, depois do corte. Transparente, ou da cor do fundo.
- **O recorte é uma escolha só, de três**: cortar a borda vazia, a área desenhada nesta animação, ou não cortar. Antes eram a lista "Recorte" e a caixa "Cortar a borda vazia", que diziam o mesmo.
- **Todo campo com dica, e todo número com a unidade e a faixa**: "De (s)", "Escala (×)", "Margem (px)"; a dica diz "de 0,05× a 8×", "de 1 a 120", e De/Até "de 0 a 2 s", com a duração da animação escolhida. Antes: 16 controles, nenhuma dica.
- **Com a pasta do projeto aberta, a exportação grava em `exportar/` dentro dela**, e o aviso do fim diz "Pasta: exportar/, dentro da pasta do projeto …". Sem pasta, os Downloads, como antes.
- **A janela cabe**: mais larga, os campos em duas colunas; 960×554 px, sem rolar, em 1920×1080 e em 1280×720 (antes, em 1280, mostrava 324 de 612 px). "Fechar sem exportar" não tem mais a cor do "Exportar".
- Uma imagem só fala no singular ("1 imagem", "1 quadro") e não leva a receita do ffmpeg.
- Testes: +9 em `exportar-e-importar`.

### v33.4 — A Árvore, a Ordem e as Propriedades: o objetivo inteiro (rodada 43, lote 5) — 06/10/2026

Rodada 43, lote 5 (doc `51`), o último da rodada.

- **A Ordem mostra o nome e a imagem numa linha só**, com menos respiro: a linha caiu de ~52 para 45 px. A miniatura de 40 px fica — é ela que distingue a bota esquerda da direita.
- **A prova do objetivo, no programa, como usuário**, com um boneco de 22 ossos e 32 desenhos: achar `hand_2`, renomear para `mao_nova` (a busca fica como foi digitada e a peça continua à vista), arrastar para o `torso` (o rodapé diz e a peça fica escolhida), a Ordem já aberta nela, 10 Ctrl+↓ até a frente do `body` (*"17ª de 27, entre head e body"*), e a ficha diz *"imagem hand_ · no osso torso"*, Ângulo −140° e *mundo −50°*. **5 cliques, 2 digitações, 12 teclas, nenhum tropeço** — eram 7, 3, 16 e cinco tropeços na conferência (doc `51`, §3).
- Desvios no fim do doc `51`: a Ordem em 45 px e não 28 (a miniatura), e sem o campo Osso na ficha rápida (o título já diz o osso).

### v33.3 — a aba Skins cabe e liga com um clique (rodada 44, lote 4) — 06/10/2026

Rodada 44, lote 4 (doc `55`), com as notas da conferência da v32.8 (doc `61`): a aba Skins cabe e liga com um clique.

- **A barra de sete ícones numa linha só**, cada um com a frase do menu na dica; "Duplicar skin" virou **"Clonar skin"**, o nome do menu. A ajuda numa linha. Em 1280×720, com a aba na frente, a lista mostra 166 de 356 px (antes, 20: nenhuma skin à vista).
- **Ligar sem arrastar**: em Feitas, a skin desligada tem um olho que a põe no topo da pilha. O arrasto continua valendo.
- **A skin nova pede o nome na hora** ("O nome da skin nova", botão "Dar o nome"), pela aba e pelo menu. Nascia "skin".
- **O lápis fala sempre** no rodapé: "Lápis na skin "inverno": o que se cria daqui em diante nasce nela".
- **A grade numa entidade** (doc `61`): a espada não tem imagem de agora, e a fonte "pasta" mostrava o mesmo que "todas" sem dizer. Agora a grade abre em "todas", e o botão "pasta" diz "Sem pasta de agora".
- **"todas" por pasta** (doc `61`): a raiz primeiro, e um cabeçalho em cada subpasta (`armadura/`, `armas/`, `inverno/`).
- Testes: +4 em `peles` e +3 em `grade-de-imagens` (já contados na v33.2, que fechou com este lote no disco).

### v33.2 — Apagar e ordenar dizem o quê (rodada 43, lote 4) — 06/10/2026

Rodada 43, lote 4 (doc `51`): Árvore, Ordem e Propriedades.

- **O Delete de um osso com gente embaixo pergunta antes**, dizendo o que vai junto: *"Apagar arm? Vão junto: 2 ossos, 6 desenhos e 1 regra"*, com a lista. Esc, ou clicar fora, não apaga. Um desenho sozinho não pergunta (decisão do Diretor, S1; o Spine e o DragonBones perguntam).
- **O rodapé do Delete diz quem e quanto**: *"Apaguei arm: 2 ossos, 6 desenhos e 1 regra. Ctrl+Z volta"*, com as chaves guardadas no fim. Dizia só "Apagar." (recado da rodada 41).
- **O botão direito no osso** ganhou Novo osso filho, Duplicar e Apagar; a lixeira da Árvore ganhou a dica inteira.
- **A Ordem rola até a peça escolhida** ao abrir a aba e ao escolher na Árvore ou na cena (ficava 1.289 px fora da vista).
- **A Ordem diz onde a peça ficou**: *"forearm: 8ª de 19, entre leg_front e head"*, no Ctrl+↑/↓ e no arrasto.
- **Ctrl+↑/↓ numa peça solta pula a pasta inteira**, sem partir a pasta em duas (S3); para entrar numa pasta, arrasta-se.
- **"frente" e "fundo"** no alto e no pé da lista da Ordem.
- Notas da conferência da v32.9 (doc 62): renomear na busca deixa o texto como foi digitado e a peça à vista com os outros achados; depois de Shift+clique as setas partem da linha clicada; a dica do campo preso pela regra não fala mais em "Ficou na base".
- O campo do Ângulo fica mais estreito quando o giro no mundo aparece ao lado: *"mundo -104°"* cortava.

### v33.1 — o Salvar diz a verdade (rodada 45, lote 1) — 06/10/2026

Rodada 45, lote 1 (doc `57`): Arquivo, exportar e importar.

- **Salvar com avisos abre a janela do programa, em português.** Antes era a caixa do navegador, em inglês, com o caminho interno (`/skins/0/attachments/…: image "hair" not found…`) e cada imagem duas vezes. Agora: *"Faltam 21 imagens: os desenhos delas ficam invisíveis"*, as imagens numa linha só, e os botões **Salvar mesmo assim** / **Voltar sem salvar**.
- **"Arquivo salvo." só para o que foi gravado ou aberto do disco.** O programa recém-aberto, o Novo projeto e a oferta do rascunho diziam "Arquivo salvo." sem nada salvo; agora dizem **"Arquivo ainda não salvo."** (regra 21).
- **Salvar numa pasta leva junto o que o `.bone` cita e mora fora dela**: o atlas, as páginas e as entidades. O herói salvo numa pasta nova levava só o `heroi.bone`; ao reabrir a pasta, as imagens e a espada sumiam. O rodapé diz o que levou: *"Levei para a pasta … heroi.atlas.json, heroi.png, espada.bone"*.
- **O pacote `.bonez` leva as entidades** que o `.bone` cita (a espada do herói). Antes saía com 3 arquivos, calado; a que não estiver aberta vira aviso na janela do fim.
- **A pasta reaberta sem o atlas diz o que falta nela**, em vez de mandar escolher a mesma pasta que acabou de ser aberta.
- **Salvar como… de um projeto com entidade, sem pasta, pede a pasta antes**: o manifesto não vai mais para os Downloads, longe do `.bone`.
- A dica do **Salvar** diz quando o `manifest.json` sai: com mais de uma base ou com entidade.
- Testes: +10 em `arquivo`.

### v33.0 — o pivô se lê e se digita (rodada 44, lote 3) — 06/10/2026

Rodada 44, lote 3 (doc `55`): o pivô se lê e se digita.

- **Campos X e Y na janela do pivô**, em px, com vírgula aceita; a cruz anda com o número digitado. A janela diz o tamanho e a faixa: "Imagem de 76 × 84 px. X de 0 a 76, Y de 0 a 84, contados da esquerda e de baixo".
- **"Deixar como está" não tem mais a cor do "Gravar o pivô"**.
- **O rodapé diz quando o pivô vale**: "Quando esta imagem entrar numa troca, ela cai com este ponto no osso" — o desenho fica parado, e parecia que nada tinha acontecido.
- **Aba Pivôs**: "X 30 px · Y 7 px" à vista, na letra das outras abas; o aviso das telas de tamanhos diferentes numa linha, a frase inteira na dica.
- **A dica da miniatura da aba Imagens traz o tamanho**: "armadura/body (76 × 84 px)".
- Testes: +5 em `pivo` (já contados na v32.9, que fechou com este lote no disco).

### v32.9 — A Árvore escolhe e anda (rodada 43, lote 3) — 06/10/2026

Rodada 43, lote 3 (doc `51`): Árvore, Ordem e Propriedades.

- **Escolher vários na Árvore**: Ctrl+clique soma (ou tira) a linha; Shift+clique escolhe a faixa desde a última clicada. Os quatro programas fazem assim.
- **A Árvore anda no teclado**: ↑ e ↓ passam de linha em linha; ← dobra o osso aberto ou sobe ao pai; → abre o dobrado. O foco fica na linha escolhida (sumia a cada clique). Quatro linhas novas em `ui/keys.ts`, escopo `arvore`.
- **Alt+clique no triângulo** dobra (ou abre) o ramo inteiro, como no Photoshop.
- **A busca**: o nome achado fica em negrito; a busca fecha num ×, não numa lixeira; a peça renomeada continua à vista (a busca segue o nome novo).
- **O rodapé fala**: "hand agora se chama mao_nova"; "Já existe "arm": forearm ficou arm2"; o nome vazio avisa; "mao_nova virou filho de torso", e a peça segue escolhida depois de soltar; desenho sobre desenho manda para a aba Ordem.
- **O nome inteiro na dica** de cada linha da Árvore, com "slot" só ali.
- Notas da conferência da v32.5 e da v32.6 (docs 58 e 59): "Largura" não quebra mais; dica nas caixas de Compensar e em "Só com a skin"; a Imagem que aparece com o osso diz de qual desenho é; o número que uma regra segura ganha borda de aviso e a dica diz quem manda; com a "base" à vista numa animação, o giro no mundo vai para a dica do disco; a dica do Ângulo diz quando o "mundo" aparece.

### v32.8 — a grade mostra as outras pastas (rodada 44, lote 2) — 06/10/2026

Rodada 44, lote 2 (doc `55`): a grade de imagens da cena.

- **Fonte nova "todas"**: a grade mostrava só a subpasta da imagem de agora, e com a espada na raiz o machado de `armas/` não aparecia de jeito nenhum. Agora "pasta · todas · objeto", cada uma com a dica do que mostra; em "todas", o rótulo traz a subpasta (`inverno/body`).
- **A grade abre sempre em "pasta"**: a fonte ficava guardada no navegador, e a "objeto" de uma peça voltava na seguinte, que só mostrava a si mesma.
- **"objeto" lembra a sessão**: a imagem que o slot mostrou e que uma troca tirou do arquivo (o `blade` que virou machado) continua na fonte "objeto".
- A grade vazia diz o que fazer ("Tente todas").
- Testes: +5 em `grade-de-imagens`. Um teste velho exigia a fonte guardada no navegador; ele agora exige o contrário, de propósito.

### v32.7 — A pasta com imagens não trava, e o que o rodapé diz é o que aconteceu (rodada 44, lotes 0 e 1) — 06/10/2026

Rodada 44 (doc `55`): Imagens, pivô e Peles.

- **Lote 0, o travamento**: abrir uma pasta com imagens (Novo projeto, Abrir pasta) parava a página por minutos. O painel Pivôs pedia o tamanho de toda imagem ainda não lida a cada redesenho, e cada resposta redesenhava: 105 leituras para 14 imagens. Agora cada imagem é lida uma vez, o que está a caminho não é pedido de novo, e as respostas de uma leva pedem um redesenho só (`panels/pivot-sizes.ts`). A pasta `exemplo/game/mao` abre e a página responde em menos de meio segundo.
- **Soltar uma imagem no slot de uma entidade troca de verdade**: a espada do herói é uma entidade, e o machado solto na linha `weapon` gravava um `path` que o leitor ignora; a cena não mudava e o rodapé dizia "agora mostra". Agora a entidade vira a imagem, pelo pivô dela.
- **Trocar pasta de origem aceita a pasta do Spriter**: a roupa de inverno numa subpasta com os mesmos nomes (`body` e `inverno/body`) era recusada inteira. Quando um dos candidatos tem o caminho exato da imagem de agora, ele É a imagem de agora; o repetido sem par exato continua avisando (regra I4). A pasta vira a origem de verdade, e o rodapé conta as imagens novas.
- **O Abrir pasta da aba pergunta** com um personagem aberto: usar a pasta neste personagem, abrir como projeto novo, ou nada. Antes o herói sumia sem pergunta.
- **Soltar uma imagem num osso fala**: só as linhas de slot aceitavam soltura, e no osso ela caía calada.
- Testes: +17 (`grade-de-imagens`, `pasta-do-projeto`, `pivo`).

### v32.6 — O número se mexe e fala (rodada 43, lote 2) — 06/10/2026

Rodada 43, lote 2 (doc `51`): Árvore, Ordem e Propriedades.

- **Arrastar o rótulo muda o número**, na ficha rápida e nos campos de baixo com unidade: um passo por pixel, Shift dez, Alt um décimo, e um Ctrl+Z por arrasto. O rótulo mostra a seta de lado.
- **A conta no campo**: `90+15`, e também sobre o valor de agora — `*2` dobra, `/2` divide, `+10` soma, `+-10` tira (o Spine faz assim). A ficha rápida não aceitava conta nenhuma.
- **A recusa fala**: o que não é número deixa o rodapé dizendo *"abc" não é número: Ângulo ficou 200°*. Antes voltava calado.
- **O giro no mundo**, só para ler, ao lado do disco do Ângulo: *mundo -77°* (o do osso somado ao dos pais). O campo continua gravando o giro local (suposição S2).

### v32.5 — A ficha diz o que é, uma vez (rodada 43, lote 1) — 06/10/2026

Rodada 43, lote 1 (doc `51`): Árvore, Ordem e Propriedades.

- **Unidade em todo número da ficha**: `px` na posição, no comprimento e no tamanho; `°` no giro e na inclinação; `×` na escala; `%` no alfa. Cada um com a dica inteira (o que o número quer dizer e para onde ele vai). O disco do Ângulo ganhou dica.
- **X, Y, giro e escala uma vez só**: a ficha rápida fica em cima, e "Posição e forma" embaixo guarda só o que ela não mostra (a inclinação). A ficha do osso caiu de 1.056 para 727 px de altura.
- **Um nome só para a peça**: o título é "Desenho: head", venha da Árvore ou da Ordem (era "Anexo: face" e "Slot: head"), e embaixo dele "imagem face · no osso head". "Slot" fica só na dica. O emissor continua "Emissor:".
- **A seção do evento** saiu das fichas de osso e de desenho; ela abre ao escolher o evento na Árvore, e na linha do tempo.
- **A malha não mostra mais X, Y, Escala e Ângulo**: o campo aceitava 50 e a cena não mudava (regra 21).
- Desvio: o recuo do emissor (10 px) voltou; quebrava os rótulos em duas linhas e passava da altura que a rodada 38 mediu.

### v32.4 — A malha e os pesos, lote 4: a capa dobra mais fácil, e a aba aperta — 06/10/2026

Rodada 41, lote 4, o último do plano (doc `43`, §5). Fotos em `backup/fotos-obra/rodada-41/lote-4/` (1920×1080 e 1280×720).

| O que ele vê | Onde |
|:---|:---|
| **Fechar o Ligar com dois ossos, e um deles sem peso, reparte os pesos sozinho**: *"Os 2 ossos ligados repartiram o peso sozinhos (Pesos automáticos em 35 vértices). Pinte para ajustar; Ctrl+Z volta"*. Antes o `cape2` entrava com 0 % e a capa não dobrava até a pessoa achar Pesos automáticos. É o que o Spine faz na primeira ligação (S1) | Malha e pesos → Ligar ossos |
| **Malha e regras → Malha → Criar ou apagar aresta**: a aresta só existia no botão da aba e nas teclas L e K. Cinza sem dois vértices, dizendo como escolher | menu |
| Com uma animação aberta, o aviso do alto da aba cabe **numa linha**: *"Animação aberta: forma e pesos vão para a base"*. A frase inteira vai na dica. Eram quatro linhas em 1280×720 | Malha e pesos |
| **Afastamento (px)** fica na linha do rótulo, com a faixa (0 a 30 px) na dica | Malha e pesos → Forma |
| O *"Testar: gire um osso ligado…"* foi para a dica do título **Pesos**; eram três linhas sob os botões | Malha e pesos → Pesos |
| A lixeira de cada osso não corta mais na borda da coluna | Malha e pesos → Ossos que influenciam |
| Com a ferramenta Pesos na mão, **`[` e `]` diminuem e aumentam o Raio**, como no Photoshop, e o rodapé diz o número. A dica do Raio ensina. Fora da ferramenta Pesos, `[` e `]` seguem escolhendo os pais e os filhos (nota da conferência da v32.2, doc `53`) | cena, ferramenta Pesos (G) |
| Mudar o Raio pela caixa **redesenha o círculo na hora**; antes o círculo velho ficava na cena até o mouse voltar (doc `53`) | cena |
| **O osso do pincel é lembrado por malha**: reescolher o desenho na Árvore não o perde mais (doc `53`) | Malha e pesos, cena |
| **`npm run pesos` volta a provar o caminho de hoje**: procura "Ligar ossos" (o nome desde a rodada 6). O passo que procurava a linha "Escolha a ferramenta", que a aba já não desenhava, passou a provar que a Forma da malha escolhida aparece com o Transformar na mão | prova |

**Não cumprido inteiro (meta 4.1):** em 1920×1080 a aba mostra Desenho, Forma e Ossos sem rolar, e os **Pesos ficam abaixo**. Em 1280×720 mostra o título Forma e um botão. O resto é a altura que a coluna dá ao grupo: com a aba Animações em uso, ela toma quase a coluna inteira. Isso é da Casca, e vai para a rodada 47 (o padrão dos painéis).

**Fora da parte:** mais uma assinatura em `viewport/viewport.ts`, ao lado da do tema: ao mudar o pincel, a cena se redesenha. Pedida pela conferência; a licença do Diretor no lote 3 era de uma linha só, e isto foi avisado a ele no fecho.

**Desvio:** o item 4.3, de botões só em ícone, não entrou. A própria folha de estilo da aba guarda um pedido do Humberto de 13/09: *"ícone sozinho não se lê"*. Nesta aba o nome fica ao lado do ícone.

Testes: **5.510** (+8 em `malha.test.ts` e +1 em `existir-nao-e-funcionar.test.ts`, vistos vermelhos antes; três contagens mudaram de propósito: a tabela de ações de 304 para 305, as de arranque de 129 para 130, as cinzas de 55 para 56). Medido às 17:24: 1 vermelho, o antigo do manual. Conformidade 120/120, roteiro 14/14, medir 90/90 e 81/90, **`npm run pesos` 14 de 14**.

### v32.3 — A linha do tempo, lote 5: o padrão — 06/10/2026

Rodada 40, lote 5, o último do plano (doc `39`, §4), com as notas das conferências da v31.7 (doc `47`) e da v32.0 (doc `50`). Fotos em `backup/fotos-obra/rodada-40/lote-5/` (1920×1080 e `1280/`). O código do padrão estava no disco desde 13h48 e viajou nas versões das rodadas 41 e 42; as notas do doc 50 entraram agora, num golpe só.

| O que ele vê | Onde |
|:---|:---|
| A **régua** anda em segundos redondos: 0,00 · 0,10 · 0,20 s (era 0,07 · 0,13); a 24 quadros, de 0,25 em 0,25 | Linha do tempo |
| O **eixo do gráfico** diz a unidade do que está à vista (*"−60°"*, *"12,5 px"*), sem casas que ninguém pediu; o tempo com *"s"* | Curvas |
| O gráfico **cabe na faixa** em 1920: o pé do eixo não fica mais sob a barra de baixo depois do Ajustar | Curvas |
| **"%"** à vista na velocidade de tocar | Linha do tempo |
| *"1 linha fechada"* no Fechar ciclo; o aviso dos pares diz onde fica a regra (*⋯ Mais → Pares de nome*) | rodapé |
| **Ctrl+Z** de uma chave apagada diz *"Desfeito: Apagar chave"* (a folha não a anuncia mais como chave nova) | rodapé |
| O **Empurrar** e o **Deslocar em laço** aceitam **quadros ou segundos** na mesma caixa: `6`, `6 q`, `0,2 s`, `0.2s`. `0,2` sem unidade é recusado, dizendo como escrever | Animação → Chaves |
| O **Colar espelhado** diz para onde as chaves foram: *"5 chaves: leg_b em 0,00 · 0,25 · 0,50 · 0,75 · 1,00 s"* | rodapé |
| Os itens do menu **Chaves** só dizem *"Abra uma animação primeiro"* quando estão cinzas | Animação → Chaves |

**Ficou de fora, com aviso:** em 1280×720 a faixa (da casca) tem 176 px e o gráfico segue cortado; a ficha rápida sem °/px/× — os dois para a rodada 46.

Testes: **5.502** (+3 em `linha-do-tempo.test.ts`; os +4 do padrão já tinham entrado nas versões da 41 e da 42). Três testes antigos mudaram de propósito: a régua em segundos redondos (`chaves`), a frase de chave nova sem o desfazer (`chaves`), e o item aceso sem a dica de cinza (`tocador`).

### v32.2 — A malha e os pesos, lote 3: o pincel na cena — 06/10/2026

Rodada 41, lote 3 (doc `43`, §5). Fotos em `backup/fotos-obra/rodada-41/lote-3/` (1920×1080 e 1280×720).

| O que ele vê | Onde |
|:---|:---|
| **O círculo do pincel segue o mouse parado** e muda de tamanho na hora com o Raio. Antes ele só andava durante a pincelada: parado, ficava onde a última terminou, e não mostrava o Raio novo até a próxima. O Spine e o DragonBones mostram o pincel antes de pintar | cena, ferramenta Pesos (G) |
| **O osso que se pinta brilha** na cor dele, grosso e por cima da malha. O `cape2` ficava escondido debaixo dela | cena, ferramenta Pesos |
| **Pincel sem osso escolhido avisa**: *"Escolha o osso que vai pintar: clique no nome dele em Ossos que influenciam, ou no osso na cena, fora da malha"*. Antes não fazia nada, e calado | rodapé |
| Ao soltar a pincelada, o rodapé diz **o osso e quantos vértices mudaram**: *"Peso de cape1 pintado em 7 vértices"*, e *"(foi para a base)"* com uma animação aberta. Antes dizia só *"Pintar pesos."* (nota da conferência da v31.9, doc `49`) | rodapé |
| Com vários vértices escolhidos, a frase da lista e a caixa usam **a mesma palavra**: *"% = peso dos 8 vértices escolhidos ("vários" = diferente entre eles)"*. Antes a frase dizia "médio" e a caixa "vários" | Malha e pesos → Ossos que influenciam |

**Fora da parte, com licença do Diretor:** uma linha em `viewport/viewport.ts`, só acrescentando. Depois do `onHover` da ferramenta, a cena se redesenha. Sem ela, nada que siga o ponteiro parado aparecia. Os 16 arquivos de teste que tocam a cena passaram com ela (1.854 testes).

**Desvio:** o item 3.5 (a cor da aresta feita à mão) saiu, porque ela já tem cor própria (doc `43`, Desvios).

Testes: **5.499** (+4 em `malha.test.ts`, vistos vermelhos antes do conserto; os testes das duas notas da conferência foram reescritos e vistos vermelhos antes). Medido às 17:06: 1 vermelho, o antigo do manual. Conformidade 120/120, roteiro 14/14, medir 90/90 e 81/90. `npm run pesos` segue em 5 de 14, com os mesmos passos velhos; a prova se conserta no lote 4.

### v32.1 — A aba das entidades, as sobras: a escolha vai junto, os avisos em português — 06/10/2026

Rodada 42, lote 2 (docs `40` e `42`). Fotos em `backup/fotos-obra/rodada-42/lote2/` (1920×1080 e 1280×720). Suposições no fim da ficha `RODADA 42`.

| O que ele vê | Onde |
|:---|:---|
| **Pôr no projeto não perde a animação**: o mecha em `idle` continua em `idle` no projeto, e o rodapé diz *"Mecha continua tocando idle"*. "A de quem recebe" e as skins de teste também vão junto. Ctrl+Z volta a teste com a escolha | Entidades |
| A janela **Problemas do arquivo** fala português e diz o nome do arquivo: *"desenho "sword": falta o arquivo da entidade lamina.bone…"*, sem caminho interno e sem "(spec 7.11)" | Problemas do arquivo |
| O **skins ▾** aparece no cartão de teste de uma entidade com skin própria, e liga a skin | Entidades |
| Em 1280×720, a **trilha e os cartões dobrados** saem ao redimensionar a janela, sem Ctrl+Z | Entidades |
| Com três níveis em 1920×1080, a **Prateleira fica à vista**: a montagem rola por dentro | Entidades |
| A pergunta do slot diz **quem entra em quê**: *"Heroi entra no slot body de mecha"*; no segundo nível, *"Mecha entra no slot casco de capacete"* | Entidades → Pôr o projeto dentro de… |
| **Pôr no projeto com o arquivo faltando avisa e não grava** (regra 21) | Entidades |
| O **mecha sobre o slot weapon** continua aceito como teste, agora por decisão escrita (Spriter e DragonBones não recusam pelo tamanho) | Entidades |

| A **receita da Faísca e do Fogo** diz como mexer na barra **Cor na vida**: o clique põe as duas pontas, o duplo clique troca a cor (ressalva do doc `48`) | Partículas |
| A **caixa** de número da Abertura (e de todo campo de linha só) tem a dica ao passar o mouse, não só a palavra (doc `48`) | Propriedades |

**Os três que caíram na medição da v32.0, consertados:** o teste "o mecha em idle" (lia anexo `null`); o `sticky` em `palette.css` saiu (a régua do lote 48); a aba Entidades não rola mais inteira em 1440 e 1280 (a Montagem e a Prateleira levam a marca de lista): `npm run medir` volta a **81 de 90**.

Nenhum campo novo no formato: `animation`, `inheritAnimation` e `skins` já estão na spec (7.11). **Não reproduzi** o "2 avisos" contra 1 problema: a barra e a janela leem a mesma lista, e pelo menu deram 1 e 1. 8 testes novos em `pasta-do-projeto`, vistos falhar antes.

### v32.0 — A linha do tempo, lote 4: o ciclo de andar — 06/10/2026

Rodada 40, lote 4 (doc `39`, §3 e §5; notas do doc `45`). Fotos em `backup/fotos-obra/rodada-40/lote-4/` (1920×1080 e `1280/`). O código estava no disco desde 13h18 e viajou dentro da v31.8 da rodada 42; esta versão é o lote fechado e conferido.

| O que ele vê | Onde |
|:---|:---|
| **Colar espelhado numa animação que repete dá a volta**: o andar de 1 s continua com **1,00 s**, e a perna de trás fica 0 s −110°, 0,5 s −60°, 1 s −110°, com a Suave. O rodapé diz *"Deu a volta no fim do laço: a duração não mudou"*; sem repetir, ele diz quanto a animação cresceu | Editar → Pose → Colar espelhado |
| **Deslocar em laço…**: as linhas das chaves marcadas andam, e o que passa do fim volta no começo (o Offset do Spine). A janela sugere meia volta | Animação → Chaves → Deslocar em laço… |
| **As curvas andam com a chave**: mover, esticar, colar e clonar refazem as alças no trecho novo (antes ficavam nos segundos antigos) | Linha do tempo |
| **Empurrar** fala em quadros **e** segundos (*"1 quadro = 0,03 s"*), diz que só as linhas das chaves marcadas andam, e o rodapé avisa quando a animação cresceu (*"de 1,00 s para 1,20 s"*) | Animação → Chaves → Empurrar as chaves… |
| **Copiar** diz no rodapé o que copiou (*"3 chaves copiadas. Ctrl+V cola na agulha"*) | barra das chaves · Ctrl+C |

Testes: **5.487** (+6 em `linha-do-tempo.test.ts`, já contados na v31.8; +7 em `pasta-do-projeto` são da rodada 42). **Três coisas de outras rodadas no fecho, nomeadas:** (1) `pasta-do-projeto` *"as sobras da aba das entidades (rodada 42, lote 2) > para cima: o mecha em idle continua em idle"* — **1 vermelho da rodada 42, conserto pronto**; (2) `acabamento` *"só a linha do tempo e a janela de diálogo usam position: sticky"* — por `panels/palette.css`, gravado às 13:32 — **da rodada 42** (a Prateleira do lote 2 dela), não da linha do tempo; (3) a medição de altura caiu de 81 para **79 de 90** pela aba **Entidades** rolando em 1440 e 1280 — da rodada 42.

### v31.9 — A malha e os pesos, lote 2: o peso de um vértice — 06/10/2026

Rodada 41, lote 2 (doc `43`, §5), mais as notas da conferência da v31.6 (doc `46`). Fotos em `backup/fotos-obra/rodada-41/lote-2/` (1920×1080 e 1280×720).

| O que ele vê | Onde |
|:---|:---|
| **Arrastar no vazio, com a Malha na mão, escolhe os vértices** com uma caixa; Shift + arrastar soma mais; o rodapé conta *"8 vértices escolhidos"*. Antes o arrasto no vazio não escolhia nada, e calado | cena, ferramenta Malha (M) |
| Com vértices escolhidos, a lista **Ossos que influenciam** mostra o peso **deles**, e cada osso ganha um **campo exato em %**: digitar 100 no `cape1` dá *"cape1 com 100 % nos 8 vértices escolhidos"*; o resto vai para os outros ossos na proporção que tinham, e o osso travado não muda. Vários que discordam mostram o campo vazio, *"vários"*. Como o campo Weight do Spine e o slider do DragonBones | Malha e pesos → Ossos que influenciam |
| Com a **ferramenta Pesos**, **Shift + clique** num vértice o escolhe ou larga sem pintar; **o pincel pinta só nos escolhidos** (como o Spine); **Esc** larga todos | cena, ferramenta Pesos (G) |
| A **pizza do vértice escolhido fica maior** | cena |
| Escolher o osso a pintar, na lista ou na cena, **não larga mais os vértices escolhidos** | Malha e pesos, cena |
| **Delete com a Malha na mão e nenhum vértice escolhido avisa**, em vez de apagar o desenho inteiro com um *"Apagar."* no rodapé: *"com a Malha na mão o Delete apaga vértices. Para apagar o desenho inteiro, troque de ferramenta ou use Editar → Apagar"*. O vértice apagado diz quantos: *"1 vértice apagado"* | cena, ferramenta Malha |
| Dicas com a frase inteira: *Pintar cape1*, *Tirar cape1 da malha*, *Criar aresta* sem vértices, o título **Pincel** (que diz que abrir liga a ferramenta Pesos, como no Spine), a lista **Malha de origem**; a dica do Raio e da Força vale também na barra e na caixa | Malha e pesos |

**Suposição S5:** o Delete da Malha sem vértice não passa adiante. Com a Malha na mão, quem aperta Delete quer apagar vértice; o Spine faz assim no modo de editar malha. Apagar o desenho continua em Editar → Apagar, ou com outra ferramenta na mão. **Recado à parte Árvore:** o Delete genérico (`tree-actions.ts`) diz só *"Apagar."* no rodapé, sem dizer o quê.

Testes: **5.480** (+10 em `malha.test.ts`). Medido às 13:28: 1 vermelho, o antigo do manual. Conformidade 120/120, roteiro 14/14, medir 90/90 e 81/90. `npm run pesos` segue em 5 de 14, com os mesmos passos velhos da v31.6; a prova se conserta no lote 4. Oito foram vistos vermelhos antes do conserto. Os dois das notas da conferência são de texto no código e não foram vistos vermelhos.

### v31.8 — As partículas, as sobras: a Abertura na receita, a faísca que se vê — 06/10/2026

Rodada 42, lote 1 (doc `41`). Fotos em `backup/fotos-obra/rodada-42/lote1/` (fundo claro e escuro, 1920×1080 e 1280×720).

| O que ele vê | Onde |
|:---|:---|
| A dica da **Faísca** (menu de cima e botão da cena) diz **Abertura 180** — sem ela a faísca sai numa coluna — e as cores que se veem no fundo claro | Partículas |
| O campo **Abertura (±°)** diz a unidade, a faixa, o típico de cada tipo (fogo 12, fumaça 20, poeira 60, faísca 180) e que 0 sai numa coluna | Propriedades, aba Movimento |
| A dica da **Velocidade** e a do **Tamanho** lembram a Abertura da faísca; o Tamanho diz o típico da poeira | Propriedades |
| A **Faísca pronta escurece** até vermelho-escuro no fim da vida e fica inteira até 75 % dela: se vê no fundo claro e no escuro | Partículas → Faísca |
| A dica da **Poeira** diz a cor: bege-claro a pardo | Partículas |

A faísca do vazio continua com 16 passos (10 da ficha, 1 da Abertura, 5 da rajada), mas agora **todos** estão nas dicas. Nenhum campo novo no formato. 5 testes novos em `paineis`, vistos falhar antes.

### v31.7 — A linha do tempo, lote 3: Ctrl e Shift iguais, o arrasto fala, a curva de verdade — 06/10/2026

Rodada 40, lote 3, com as notas da conferência da v31.4 (doc `44`). Fotos em `backup/fotos-obra/rodada-40/lote-3/` (1920×1080 e `1280/`). O código das três primeiras linhas já estava no disco quando a rodada 41 fechou a v31.6, e viajou dentro dela; esta versão é o lote fechado e conferido.

| O que ele vê | Onde |
|:---|:---|
| No **Resumo**, **Ctrl soma e Shift tira**, como no losango (era o contrário) | Linha do tempo |
| O **duplo clique apaga a chave**. Ele nunca funcionava: o primeiro toque redesenha a folha, e o navegador perdia o clique; agora o duplo é contado no próprio toque | Linha do tempo |
| Durante o **arrasto de chaves**, junto do mouse: *"0,57 s · q 17 · +2 quadros"* | Linha do tempo |
| A folha desenha **a curva de verdade** de cada trecho, pelas alças do arquivo: a Suave é um S, a **Entrada suave** e a **Saída suave** são diferentes entre si, a Parada é um degrau pontilhado; 24 px de altura (o arco de 8 px não se via) | Linha do tempo |
| **"Curva à mão…"** no menu da chave e no menu de cima, o mesmo nome da dica | botão direito na chave · Animação → Curva da chave |
| **Ajustar**, na aba Curvas, com uma chave escolhida, **enquadra a linha dela** (a rotação da perna de −60 a −110, em vez de −200 a 100) | Curvas |

Testes: **5.464** (+3 em `curvas.test.ts`; os +3 de `linha-do-tempo.test.ts` já tinham entrado na contagem da v31.6).

### v31.6 — A malha e os pesos, lote 1: o padrão e os nomes — 06/10/2026

Rodada 41, lote 1. Pesquisa e plano em `documentos/projeto do programa/43 A MALHA E OS PESOS - pesquisa e conferencia 2026-10-06.md`. Fotos em `backup/fotos-obra/rodada-41/lote-1/` (1920×1080 e 1280×720).

| O que ele vê | Onde |
|:---|:---|
| O Pincel diz o que é cada número: **Raio (px)** e **Força (%)**, de 0 a 100, com a faixa na dica. Era *"Raio 11"* e *"Força 0,5"*, sem unidade nem dica. O arquivo e o pincel continuam em 0 a 1: só a tela fala em % | Malha e pesos → Pincel |
| **Somar, Subtrair, Substituir e Suavizar** têm dica, cada uma dizendo o que a passada faz | Malha e pesos → Pincel |
| **Suavizar tudo, Podar, Tirar pesos e Apagar vértice** têm a frase do menu na dica (antes a dica repetia o nome) | Malha e pesos |
| Os ossos ligados aparecem **com o nome inteiro**: `cape1` e `cape2` viravam "ca…" e "cap…". A palavra "Travar" saiu de cada linha; uma linha em cima diz *"% = peso médio na malha inteira · a caixa trava o osso"*, e a dica da caixa diz qual osso ela trava | Malha e pesos → Ossos que influenciam |
| O rodapé diz o resultado: *"Malha gerada: 35 vértices, 57 triângulos"*, *"Contorno traçado: …"*, *"Vértice apagado"*, *"Aresta criada"*, e o que o **Usar forma** criou. Antes dizia só o nome do botão, ou nada | rodapé |
| *"peso 1 em todos os pontos"* virou **"peso 100%"**, como a lista | rodapé, ao ligar um osso |
| A malha ligada é dita como **malha ligada**, com a malha de onde vem a forma. Era *"Este anexo é do tipo linkedmesh. A malha só vale para desenhos"*. Depois de desfazer o Usar forma, a aba pede outro desenho, em vez de *"tipo nenhum"* | Malha e pesos → Desenho escolhido |

**Desvios do plano:** o item 1.7 saiu. A lista "Malha de origem" oferecer a própria malha é o uso certo: cria uma gêmea ligada dela no mesmo slot. O item 3.5 também saiu, porque a aresta feita à mão já tem cor própria, um marrom.

Testes: **5.461** (+8 em `malha.test.ts`). Medido às 13:02: 1 vermelho, o antigo do manual. Conformidade 120/120, roteiro 14/14, medir 90/90 e 81/90. **`npm run pesos` em 5 de 14, e não por este lote**: a prova procura o botão "Ligar" (é "Ligar ossos" desde a rodada 6) e a linha "Escolha a ferramenta", que a aba já não tinha antes (conferido na cópia `backup/malha-r41_2026-10-06_12-53_antes-do-lote-1/`). Conserto da prova no lote 4.

### v31.5 — A linha do tempo, lote 2: a folha cabe — 06/10/2026

Rodada 40, lote 2 (doc `39`, §2.4). Fotos em `backup/fotos-obra/rodada-40/lote-2/` (antes e depois, 1920×1080 e 1280×720).

| O que ele vê | Onde |
|:---|:---|
| Em 1920×1080, com os Detalhes abertos, **2 linhas de chave e meia** à vista, onde cabia **uma** | Linha do tempo |
| O quadro **Chave de evento** nasce **fechado** (era 115 px aberto no pé da folha); quem o abre o encontra aberto | Linha do tempo, no pé |
| A **barra dos botões das chaves** divide a linha do tocador quando cabe, e só desce para uma linha própria quando não cabe; barra e títulos de osso mais baixos | Linha do tempo |
| Depois de **colar, colar espelhado, empurrar ou espelhar**, a folha **rola até as chaves novas** — a `leg_b` deixou de nascer escondida debaixo da `leg` | Linha do tempo |

**Ficou de fora, com aviso:** em 1280×720 a faixa inteira tem 176 px (a casca dá a altura à cena), e nenhuma linha de chave cabe. A altura da faixa é da Casca; anotado pelo Diretor para a rodada 46.

Testes: **5.445** (+2 em `linha-do-tempo.test.ts`).

### v31.4 — A linha do tempo, lote 1: a curva e o valor se veem — 06/10/2026

Rodada 40, lote 1. Pesquisa e plano em `documentos/projeto do programa/39 A LINHA DO TEMPO - pesquisa e conferencia 2026-10-06.md`. Fotos em `backup/fotos-obra/rodada-40/lote-1/` (1920×1080 e `1280/`).

| O que ele vê | Onde |
|:---|:---|
| **A curva entre as chaves, na própria folha**: reta para Linear, arco para as suaves, **pontilhado para a Parada** (como o dopesheet do Spine). Antes todo losango era igual | Linha do tempo |
| A dica do losango diz **o que a chave é**: *"0,50 s · Rotação de leg = −86° · Parada"* — tempo, valor com a unidade (°, px, ×) e a curva; a última diz *"a última: sem curva"*. Os gestos ficam na segunda linha | Linha do tempo |
| **Clicar numa chave leva a agulha até ela**, e a ficha mostra o valor DELA. Ctrl e Shift não mexem a agulha. No Resumo, o mesmo | Linha do tempo |
| A aba **Curvas abre na chave escolhida** na Linha do tempo, com os botões acesos; escolher no gráfico escolhe na folha | Curvas |
| **Um nome por curva**: o gráfico diz **Parada** (não "Degrau"), e o menu da chave ganhou **Entrada suave** e **Saída suave**. A "Suave" do menu é a mesma curva do botão do gráfico | botão direito na chave · Animação → Curva da chave · Curvas |
| O menu da chave **abre para o lado que tem espaço**: no pé da tela a "Parada" saía da janela | botão direito na chave |
| As dicas dos botões do gráfico sem o *".."* no meio | Curvas |

Testes: **5.443** (+7 em `curvas.test.ts`). Quatro testes antigos mudaram de propósito: o nome "Degrau" virou "Parada", a Suave do menu passou a ser a do gráfico (0,42/0,58), o menu tem cinco nomes, e a dica do losango tem duas linhas.

### v31.3 — A aba das entidades, lote 7: os casos difíceis — 06/10/2026

Rodada 39b, o último lote do plano `22`. Fotos em `backup/fotos-obra/rodada-39b/lote7-1920/` e `lote7-1280/`.

| O que ele vê | Onde |
|:---|:---|
| A peça de teste cujo arquivo sumiu da pasta: o cartão **fica**, com **"? motosserra"** e a linha **falta o arquivo**. A ligação não some, nada é desenhado no lugar, e a barra de avisos diz o nome | aba Entidades · barra de avisos |
| O slot que some (a imagem apagada) com uma peça de teste: a peça vai para **"sem lugar · hair"**, no topo do cartão, e a barra de avisos diz o que fazer. Desligar continua valendo | aba Entidades |
| Na tela baixa (1280×720), os cartões **nascem dobrados**: só o nome e a palavra. O ▸ abre; o AQUI e a cadeia dele nascem abertos | aba Entidades |
| Com alguém em volta, na tela baixa (ou com mais de 4 níveis), os de fora viram a **trilha** *nave › mecha › HEROI*. Clicar num nome mostra aquele nível | aba Entidades |
| A **Prévia** mostra quem está em volta, sempre, no relógio dela, e cabe o conjunto na tela (desvio do lote 4) | aba Prévia |

| Conserto | O que era |
|:---|:---|
| A cena com quem está em volta | os níveis de fora ficavam guardados num lugar só, para todos os documentos: dois documentos com a mesma cadeia trocavam o desenho um do outro. Agora cada documento guarda os seus |

### v31.2 — As partículas, lote 6: a faísca que se vê, e os números na porta — 06/10/2026

Rodada 38, parte 2, lote 6: o que faltou na prova final (doc `38`). Fotos em `backup/fotos-obra/rodada-38/lote-6/` (cena limpa, um emissor só; 1920×1080 e 1280×720).

| O que ele vê | Onde |
|:---|:---|
| A **Faísca pronta se vê de primeira**: 40 por estouro (antes 24), maiores (fator 0,7 a 1,1), **laranja cheio** (o amarelo-claro sumia no fundo claro) | Novo: faísca, e o menu Partículas |
| As portas do **menu de cima** dizem os números, como as da barra: *"Um emissor novo, já como fumaça: vida longa (1,8 a 2,6 s), sobe devagar (30 a 55 px/s), tamanho 1,6 a 2,2, cresce 2,5 vezes, cinza escuro"* | menu Partículas |
| O **Tamanho diz o típico**: *fumaça 1,6 a 2,2 (e cresce na vida), fogo 1,6 a 2,4, faísca 0,7 a 1,1* | a dica |
| A faísca **feita do Novo: vazio**, em 10 passos, numa cena limpa | foto `b_faisca_do_vazio_*` |

Testes novos em `paineis.test.ts` (três); falharam antes. `ui/menus.ts` (arquivo de passagem): só as quatro dicas das portas de partículas mudaram, a pedido do Diretor.

**Anotado, não mexido:** o seletor de cor do sistema é a mão do Humberto (rodada 20).

### v31.1 — A aba das entidades, lote 6: o que a peça toca, as skins, as iguais — 06/10/2026

Rodada 39b (`EXECUTANDO · rodada 39b`): as notas do doc `34`, o defeito 1 do doc `36` e o lote 6 do plano `22`. Fotos em `backup/fotos-obra/rodada-39b/`.

| O que ele vê | Onde |
|:---|:---|
| **anima ▾** no cartão de teste: *parada*, *a de quem recebe* ou uma animação dela. *"Robo toca andar (teste). O arquivo não muda."* Sem a animação pedida, o cartão diz *"robo não tem idle: parada"* | aba Entidades, cartão tracejado |
| **anima ▾** na peça do projeto: *livre — o jogo escolhe* ou uma animação; vira chave na faixa, da agulha em diante. Com a base aberta, diz *"Abra uma animação"* | cartão PROJETO |
| **skins ▾**: liga e desliga uma skin de teste, por cima da default. O arquivo da peça não muda | cartão de teste |
| O mecha **em volta** toca a animação do cartão **no relógio da agulha**, e o boneco segue o banco | cena, com Na cena |
| A mesma entidade duas vezes: *"espada 1 de 2"*, e o rodapé diz *"Agora há 2 cópias de espada, separadas"* | cartões |
| **Trocar todas as iguais (N)**: a peça de teste entra em todos os slots com a mesma imagem, num passo | cartão de teste |
| Três portas novas no menu **Entidades**: *O que a peça de teste toca…*, *Skins da peça de teste…*, *Teste em todas as iguais* | menu |
| A linha cinza da linha do tempo diz o que cada peça toca, e o que está em volta | linha do tempo |

| Conserto | O que era |
|:---|:---|
| Doc `36`, defeito 1 | **Pôr no projeto para cima** baixava o conjunto 135 px na tela. O desenho era o mesmo, só deslocado: o boneco saía da âncora do mecha. Agora a vista anda o mesmo tanto, e o Ctrl+Z a devolve. As chaves do boneco não mudam |
| Doc `34`, nota a | o Salvar que parou falava em inglês e citava um caminho interno. Agora: *"Salvar: parou antes de gravar, porque heroi.bone tem 1 problema. Nada foi gravado"* |
| Doc `34`, nota b | a linha não ficava vermelha ao soltar a peça onde ela já está, ou o cartão de teste no próprio slot. Agora fica, e diz por quê. O mecha sobre o weapon é aceito, e o rodapé diz que ele fica *"por cima de espada (que continua no arquivo)"* |
| Doc `34`, nota c | não era defeito: na foto, o grupo das Animações estava **recolhido** (▸). Medido nas 3 telas: a aba Entidades rola por dentro, e as Animações não perdem altura |

### v31.0 — As partículas, lote 5: fumaça, fogo e faísca do zero — 06/10/2026

Rodada 38, parte 2, lote 5: o objetivo da rodada (*"fiz uma fumaça"*, régua do `26`), com os tropeços da conferência da v30.7 (doc `35`: a fumaça do zero dava neblina parada). Fotos em `backup/fotos-obra/rodada-38/lote-5/`.

**O objetivo, feito na tela, a partir do "Novo: vazio"** (`do_zero_juntas.png`):

| Efeito | Passos | Os passos |
|:---|:---:|:---|
| **Fumaça** | 9 | Forma Círculo · Raio 20 · Taxa 10 · Vida de 1,8 a 2,6 · Velocidade de 30 a 55 · Tamanho de 1,6 a 2,2 · Tamanho na vida ▾ cresce · Some na vida ▾ aparece e some · Cor ao nascer cinza escuro |
| **Fogo** | 9 | Forma Círculo · Raio 10 · Taxa 40 · Vida de 0,6 a 1 · Velocidade de 60 a 110 · Gravidade Y 60 · Tamanho de 1,6 a 2,4 · Tamanho na vida ▾ encolhe · Cor ao nascer laranja |
| **Faísca** | 10 | Taxa 0 · Rajadas ▾ Mais uma rajada · Quantas 24 · Vida de 0,3 a 0,6 · Velocidade de 180 a 320 · Abertura 180 · Vira com o voo · Gravidade Y −400 · Tamanho de 0,45 a 0,75 · Cor ao nascer amarelo |

E o caminho curto: **Novo: fumaça** já é a fumaça, e a ficha a ajusta.

| O que ele vê | Onde |
|:---|:---|
| A porta da barra diz **Novo: vazio · Novo: fogo · Novo: fumaça · Novo: faísca · Novo: poeira**, e cada dica diz *"Um emissor novo, já como fumaça: mude o que quiser na ficha. O que a faz fumaça: vida longa (1,8 a 2,6 s), sobe devagar (30 a 55 px/s), cresce 2,5 vezes, aparece e some"* | botão Partículas da barra |
| O **vazio se vê**: magenta, 20 por segundo, maior, sumindo no fim da vida (antes: pontinhos brancos pálidos) | Novo: vazio |
| A **Velocidade diz o típico**: *fumaça 30 a 60, fogo 60 a 110, faísca 180 a 320* | a dica |
| A **Cor na vida sem cor** diz *"Só a Cor ao nascer"* dentro da barra (antes: barra branca, muda) | aba Cor |
| A barrinha da opacidade na **faixa de duas cores** (Cor ao nascer de / até): o **rodapé diz o número** ao mudar (*"Cor ao nascer (até): opacidade 42 %"*), já que ao lado não cabe (doc 37) | aba Cor |
| A **janela da explosão** diz que é o tempo da explosão **inteira**, e não a Vida de cada partícula (doc 37) | a dica |
| A dica da linha da forma diz *"A direção se muda na aba Movimento; 'Para fora' faz sair da forma"* | aba Forma |

Testes novos em `paineis.test.ts` (a porta, o vazio, a velocidade típica, a dica da saída, a Cor na vida vazia); falharam antes. Reescritos de propósito: os rótulos do menu da barra, e o vazio no arquivo (`paineis` e `arvore`), que agora leva os quatro campos que o fazem visível.

**Desvios** (no fim do `27`): o 5.1 (a receita) foi para a dica da porta; o 5.2 (trocar de exemplo) e o 5.3 (aditivo na ficha) ficaram de fora; o menu de cima manteve os rótulos.

**Achado e não consertado:** na ficha, a barrinha mexida pelo **teclado** só anda uma casa: ao gravar, o painel redesenha e o foco se perde (a mesma forma do Ctrl+↓ da Ordem, consertado no 4b). Fica para a rodada do padrão dos painéis.

**O travamento do Chrome sem janela, explicado:** acontecia quando um arquivo do editor era gravado com a página aberta no servidor de desenvolvimento. O Vite recarrega a página, ela pergunta *"sair sem salvar?"*, e essa janela nativa trava o navegador sem janela. Não é defeito do programa montado.

### v30.9 — As partículas, lote 4b: as notas da conferência da v30.5 — 06/10/2026

Rodada 38, parte 2, lote 4b: as notas do doc `33` (conferência da v30.5). Fotos em `backup/fotos-obra/rodada-38/lote-4b/`. **Aviso de passagem:** o código foi gravado até 09h42, antes do fecho da v30.8 (rodada 39), que já o mediu e o leva.

| O que ele vê | Onde |
|:---|:---|
| **Ctrl+↓ e Ctrl+↑ andam a cada tecla** na aba Ordem. Antes só a primeira andava: o passo redesenhava a lista, o foco caía no corpo da página e a tecla seguinte não chegava a ninguém. Provado antes e depois, três teclas seguidas | aba Ordem |
| **O número da opacidade à vista**, ao lado da barrinha (*"100 %"*), mudando enquanto se arrasta | Cor do emissor, e toda ficha com uma cor |
| **X, Y e o Ângulo do emissor** dizem a unidade e a faixa (*"em px, qualquer número"*, *"em graus, de 0 a 360: gira a Direção e a forma juntas"*) | aba Lugar |
| Dicas em **frase inteira**: Tremor (*"fração do intervalo entre duas partículas… 0 num ritmo certo, como um relógio; 1 em tempos soltos, como chuva"*), Explosão (*"quantas nascem juntas"*), Vira com o voo (*"cada partícula aponta para onde vai"*), Na frente (*"as que acabaram de nascer"*) | as dicas |

Testes novos em `paineis.test.ts` (três); falharam antes. O Ctrl+↓ é DOM e não tem teste sem navegador: a prova é a tela, antes e depois.

**Desvio:** na faixa de duas cores (Cor ao nascer) o número da opacidade fica só na dica — ao lado não cabia, e o quadrado da cor sumia.

### v30.8 — A aba das entidades, lote 5: Pôr no projeto — 06/10/2026

Rodada 39, lote 5 do plano `22 A ABA DAS ENTIDADES`: o **"Bake Active To Entity"** do Spriter. A ligação de teste vira arquivo — **só no arquivo aberto**, nunca noutro. Fotos em `backup/fotos-obra/rodada-39/lote5-1920/` e `lote5-1280/`.

| O que ele vê | Como |
|:---|:---|
| O botão **Pôr no projeto** | na barra da aba Entidades, ícone e palavra. Uma ligação de teste: grava. Várias: pergunta qual. Nenhuma: fica cinza, e a dica diz por quê. Também no **botão direito** de cada cartão de teste, e no menu Entidades → **Pôr no projeto…** |
| Para baixo (a espada no cabelo) | a espada entra **de verdade** no slot, pela mesma conta da grade, e o cartão passa a ter borda cheia e PROJETO. Se o slot já tinha uma peça do projeto, ela sai, e o rodapé diz qual |
| Para cima (o boneco no mecha) | o mecha entra **no boneco**, num slot novo, com **Este boneco** no piloto, posto de modo que o piloto caia exatamente onde o boneco está: o desenho fica igual ao do teste. O rodapé avisa: *"Agora heroi LEVA mecha: no teste não levava."* |
| Dois níveis para cima (a nave em volta do mecha) | **não grava**: *"Nave leva mecha, e nenhum dos dois é o arquivo aberto. Para gravar, abra mecha e ponha nave nele"*. Ao gravar o mecha, a nave em volta dele sai, e o rodapé diz |
| **Ctrl+Z** | volta a ligação a **teste**, num passo só: o arquivo letra por letra, e o teste de volta na aba |
| Trazer a mesma entidade duas vezes (nota c do `29`) | o rodapé agora diz que fez uma **cópia** com outro nome, e que a que já existe se usa pela prateleira |

Vai **para a base**, como a grade e toda mexida estrutural (o rodapé diz, numa animação aberta). Nada muda no formato: o que se grava é o anexo `skeleton` e o `around` que a spec 7.11 já tem. Testes: 5 novos em `pasta-do-projeto.test.ts`, 1 em `acoes.test.ts`.

### v30.7 — As partículas, lote 4: cada forma diz onde nasce e para onde sai — 06/10/2026

Rodada 38, parte 2, lote 4 (plano `27`, §4). **Aviso de passagem:** o código e os testes deste lote foram gravados de 09h22 a 09h24, no meio do fecho da v30.6 (rodada 39): a suíte dela viu 4 vermelhos (os testes, antes do código) e a v30.6 já leva este lote. Daí a regra do semáforo `backup/FECHO-EM-CURSO.txt`. Fotos em `backup/fotos-obra/rodada-38/lote-4/` (1920×1080 e 1280×720).

O Humberto: *"a linha gera na linha, mas o círculo e o quadrado não sei o que fazem nem como controlar"*.

| O que ele vê | Onde |
|:---|:---|
| Embaixo dos botões de forma, uma frase curta: **"Círculo: nasce no disco, sai para cima"** — onde nasce e para onde sai (a Direção, ou para fora). Cabe inteira em 1280×720; a frase longa fica na dica | aba Forma |
| **Para fora (0–1)** mora agora na aba **Forma**, ao lado da forma (antes "Sair do centro", na aba Movimento). Com 1, o fogo sai em volta do círculo. O Ponto não tem a linha: não há de onde sair "para fora" | aba Forma |
| No **Arco**, espessura e trecho numa linha só (**Borda · trecho**), para caber o "para fora" | aba Forma |
| Escolher o **Arco** dá um arco **cheio**, venha de onde vier (antes herdava a espessura do Anel) | botões de forma |
| O **Ponto** desenha um **anel tracejado** em volta da estrela na cena (antes não desenhava nada) | a cena |

Nenhum campo novo no formato. Testes novos em `paineis.test.ts` (a frase da saída e a linha curta · o arco cheio) e `cena.test.ts` (o anel do ponto); falharam antes. Reescritos de propósito: as listas de linhas da aba Forma (Círculo, Anel, Arco, Retângulo, Malha, Linha, Caminho), que ganharam "Para fora (0–1)".

**O Caminho** (4.5 do plano): a conformidade já prova que nasce no caminho (casos `P-021` a `P-025`); aqui não mudou nada.

### v30.6 — A aba das entidades, lote 4: ligar para cima — 06/10/2026

Rodada 39, lote 4 do plano `22 A ABA DAS ENTIDADES`, e três notas da conferência da v30.1 (`29`). Fotos em `backup/fotos-obra/rodada-39/lote4-1920/` e `lote4-1280/`, com o arrasto de verdade.

| O que ele vê | Como |
|:---|:---|
| **Ligar para cima** | arrasta o cartão AQUI (o boneco) até uma entidade da Prateleira (o mecha); a janela pergunta **em que slot**. O mecha passa a ficar **por fora**, tracejado, TESTE, e o boneco na linha do piloto. O rodapé: *"Heroi entrou em mecha, no slot piloto: teste. Heroi não leva mecha."* |
| Mais um nível | o cartão de fora (o mecha) se arrasta até a nave: o mecha entra na nave. A árvore se lê de fora para dentro |
| **Na cena**, com alguém em volta | a cena desenha o mecha **por trás e pela frente** do boneco (o que vem antes do piloto, o boneco, o que vem depois). O boneco se apoia no slot do mecha — **as chaves dele não mudam**, só onde ele está na tela. O mecha fica parado (a pose de repouso: escolher o que ele toca é o lote 6) |
| **Tirar de volta** | botão direito no cartão de fora, ou menu Entidades → Tirar de volta. Sai ele e o que estava em volta dele (a nave não fica pendurada) |
| As recusas | a **volta sem fim** (o mecha que já leva o boneco, ou a espada que já está na mão dele), o que já está na montagem, o slot sem desenho e o **fundo demais** (8 níveis, spec 7.11) ficam vermelhos **já no arrasto**, e o rodapé diz por quê |
| Menu **Entidades** | duas portas novas: **Pôr o projeto dentro de…** e **Tirar de volta** |
| Nota (a) do `29` | o slot pendurado com uma animação aberta (sem desenho na pose de repouso) **recebe** teste; e toda linha que não recebe diz o porquê no rodapé — a recusa calada parecia defeito |
| Nota (b) | a dica de *Pôr em teste neste slot…* diz que vale com imagem **ou entidade** escolhida |
| Nota (d) | o **Salvar** que parava calado (o arquivo com problemas, e a pergunta "salvar mesmo assim?" respondida "não" pelo navegador sem janela) agora diz: *"Salvar: parou antes de gravar, por N problemas no arquivo: …. Nada foi gravado"* |

**Nada muda no formato.** A cadeia mora no `manifest.json`, em `extras.RECORTE_projeto.montagem.acima`. Por dentro: `doc/montagem.ts` (a cadeia, `cadeiaAcima`, `comAcima`, `semAcima`), `viewport/montagem-view.ts` (os níveis, a âncora, o desenho em camadas), `entities-cards-model.ts` (as recusas, o gesto). Testes: 14 novos em `pasta-do-projeto.test.ts`, 1 em `acoes.test.ts`.

Fica para depois: a **Prévia** ainda mostra só o que está para baixo (o boneco com as peças de teste), e não o mecha em volta.

### v30.5 — As partículas, lote 3: todo número com unidade e faixa, e a Ordem que anda — 06/10/2026

Rodada 38, parte 2, lote 3 (plano `27`, §4), com as notas das conferências da v30.2 (doc `30`) e da v30.3 (doc `31`). Fotos em `backup/fotos-obra/rodada-38/lote-3/`.

**Aviso de passagem:** o código deste lote foi gravado às 08h56, e a v30.4 (rodada 39, fechada às 08h58) já o levou no zip e no `programa/`, medido verde. Esta versão fecha o lote como dele, com o que veio depois.

| O que ele vê | Onde |
|:---|:---|
| **Todo número diz a unidade e a faixa**, no rótulo ou na dica | a ficha do emissor inteira: `MEDIDA` em `particle-sheet.ts` |
| **Raio (px)**, **Início (px)**, **Fim (px)** | aba Forma |
| **Freio (por s)** no lugar de "Arrasto (1/s)", e a conta da §9 na dica: *0,5 tira 39 %; 1 tira 63 %; 2 tira 86 % da velocidade em um segundo* | aba Forças |
| Direção: *0 para a direita, 90 para cima, 180 para a esquerda, 270 para baixo* · Gravidade: *Y positivo puxa para cima* · Espessura: *em px é raio × espessura* · Explosão: *força de 0 a 1*, janela em segundos | as dicas |
| **A barrinha da cor** diz *"opacidade: 100 % (de 0 a 100 %: 0 é invisível, 100 é cheia)"*, e muda ao arrastar | toda ficha com cor (`alphaTip`) |
| **O passo de um lugar na Ordem anda** até o vizinho que se vê. Antes trocava com um caminho ou uma caixa, dizia "andou", e nada mudava | aba Ordem, Ctrl+↑/↓ e os botões (doc 30, a) |
| **Clicar no emissor na Ordem abre a ficha do emissor**, como o nó no Godot | aba Ordem (doc 30, b) |

Testes novos: `paineis.test.ts` (todo número com unidade e faixa · a conta do freio · a barrinha da cor) e `ordem.test.ts` (o passo pula o que não se vê · a linha do emissor abre a ficha dele). Todos falharam antes. Reescritos de propósito: quatro rótulos com unidade, e as dicas que agora levam a medida no fim.

**Desvios** (no fim do `27`): a Espessura continua de 0 a 1, com a conta em px na dica; a Direção não ganhou disco.

### v30.4 — A aba das entidades, lote 3: Na cena — 06/10/2026

Rodada 39, lote 3 do plano `22 A ABA DAS ENTIDADES` (o "Aparecer na linha do tempo" do `02`, escrito **Na cena**: pergunta 7). Fotos em `backup/fotos-obra/rodada-39/lote3-1920/` e `lote3-1280/`, com o mouse.

| O que ele vê | Como |
|:---|:---|
| O botão **Na cena** | no alto da aba Entidades, ícone e palavra; a frase inteira na dica. Apertado, ele fica aceso |
| Na cena ligado | a cena desenha a peça de teste **no lugar da imagem**, na ordem dela, **normal** (para julgar como fica — pergunta 2). Animando, ela segue o osso do slot |
| O clique | **passa** pela peça de teste: vai ao que o arquivo tem ali (a imagem de baixo). A peça nunca é escolhida |
| A linha do tempo | as peças de teste **não têm faixa**. Uma linha só, cinza e tracejada, no fim: *"Montagem de teste na cena: espada (parada) no hair. Não entra na animação."* Só lê |
| Salvar e reabrir | o Na cena volta como estava (no `manifest.json`); o `.bone` não muda |
| Ctrl+Z | desfaz o liga e desliga, um passo |

Por dentro: `viewport/montagem-view.ts` (novo). Só durante o desenho, o slot vivo mostra o anexo do esqueleto montado; depois do quadro ele volta, letra por letra (provado). O esqueleto montado é guardado enquanto o arquivo e a montagem não mudam. Testes: 6 novos em `pasta-do-projeto.test.ts`. Na linha do tempo FECHADA a linha de teste fica abaixo da vista (só cabe uma faixa); com os Detalhes abertos ela aparece.

### v30.3 — As partículas, lote 2: toda faixa diz "de … a …" — 06/10/2026

Rodada 38, parte 2, lote 2 (plano `27`, §4). Fotos em `backup/fotos-obra/rodada-38/lote-2/` (1920×1080 e 1280×720).

O Humberto, sobre a Vida "0,5 · 0,9": *"eu não entendi quando tava usando"*. As duas caixas de uma faixa diziam "mínimo" e "máximo" só na dica.

| O que ele vê | Onde |
|:---|:---|
| **de 0,6 a 1** | Vida (s), Velocidade (px/s), Tamanho (fator), Giro inicial (°), Giro/s (°), Cor ao nascer |
| **X 0 Y 60** | Gravidade (px/s²), Início e Fim da linha |
| **larg. 60 alt. 40** | Retângulo (px) |
| **força 0 janela 1** | Explosão · janela |

O nome sai do rótulo inteiro que a dica já tinha (`particle-sheet.ts`, `comNomeCurto`): nada novo no formato, nenhum campo novo. Teste novo em `paineis.test.ts`; falhou antes do conserto. Medido: nada transborda em 1280×720.

**Fica de fora:** a parte 2.2 do plano (dois números iguais lidos como um só, "1 s" com um ▾ para abrir a faixa).

### v30.2 — As partículas, lote 1: o emissor na Ordem, e exemplos que se veem — 06/10/2026

Rodada 38, parte 2, lote 1. Plano: `documentos/projeto do programa/27 AS PARTICULAS - pesquisa e conferencia 2026-10-06.md`, §4. Fotos em `backup/fotos-obra/rodada-38/lote-1/` (1920×1080 e 1280×720).

| O que ele vê | Como |
|:---|:---|
| **O emissor na aba Ordem** | aparece como qualquer peça, com o ícone de partícula. Arrastar, os quatro botões e `Ctrl + setas` o põem na frente ou atrás das imagens; em Animando vira chave; `Ctrl+Z` desfaz. Pedido do Humberto: *"as partículas devem aparecer na ordem de desenho"*. O desenho já obedecia à `drawOrder` (§9.9 da extensão); faltava a porta |
| **Fogo maior** | nasce com 51 a 77 px (antes 26 a 42), disco de 10 px, sobe mais rápido |
| **Fumaça que se vê** | cinza **escuro** (antes cinza-claro sobre a grade cinza), alfa 0,75 no auge, chega a ~176 px |
| **Faísca que não some** | dois estouros, em 0 e 0,5 s (cabem na animação mais curta do herói, 0,6 s), faíscas maiores e mais rápidas |

Nenhum campo novo no formato. Testes novos: `ordem.test.ts` (o emissor entra na Ordem, no lugar dele, e a `MoveSlot` o leva à frente) e `paineis.test.ts` (os exemplos se veem: tamanho, contraste, repetição). Os dois falharam antes do conserto.

**Correção do documento 27:** o emissor **não** nascia atrás da perna. Ele já desenhava na frente; era pequeno e fraco. O erro, pela forma: *concluí a ordem de desenho pelo olho, numa foto onde a partícula era menor que a perna.*

### v30.1 — A aba das entidades, lote 2: ligar em teste — 06/10/2026

Rodada 39, lote 2 do plano `22 A ABA DAS ENTIDADES`. Fotos em `backup/fotos-obra/rodada-39/lote2-1920/` e `lote2-1280/`, com o arrasto de verdade (mouse, Chrome sem janela).

| O que ele vê | Como |
|:---|:---|
| **Ligar em teste** | arrasta uma entidade da Prateleira até a linha de um slot, na Montagem: ela entra ali **em teste**. O cartão fica **tracejado**, com a palavra **TESTE** e a cor de aviso (três sinais, nunca só a cor). O rodapé: *"Espada no slot hair: teste. A animação não muda."* |
| **Trocar** e **mudar de slot** | soltar outra peça no mesmo slot troca a de teste; arrastar o cartão de teste para outra linha muda de slot. Um teste por slot |
| **Desligar** | arrastar o cartão de teste de volta para a Prateleira, ou botão direito nele → Desligar |
| **+ N outras imagens** | virou um botão: abre uma linha por imagem, para qualquer uma receber (regra 1 do `02`); *"− esconder as outras imagens"* fecha |
| A volta sem fim | a linha fica **vermelha** já no arrasto, e o rodapé diz por quê (*"arma já leva heroi…"*). O slot que não mostra nada na pose de repouso também recusa, dizendo |
| **A Prévia** | desenha o boneco com as peças de teste no lugar das imagens; na tela cheia, a frase *"Montagem de teste à vista: 1 peça. Ela não entra na animação nem no arquivo."* A cena não muda (a cena é o lote 3) |
| **Ctrl+Z** | desfaz o gesto inteiro, um passo; refazer devolve |
| Menu **Entidades** | duas portas novas: **Pôr em teste neste slot…** e **Desligar o teste deste slot**, com a imagem escolhida na cena |

**Onde o teste mora:** no `manifest.json`, em `extras.RECORTE_projeto.montagem` (spec 2.9: estado do editor, o leitor ignora). **O `.bone` sai igual, letra por letra**, com e sem montagem (provado). Salvar e reabrir a pasta traz a montagem como ficou; o pacote `.bonez` também a leva. Nada muda no formato.

Por dentro: `doc/montagem.ts` (a montagem e o comando `SetMontagem`, com `apply` e `revert` exatos); a regra do "comando do projeto" escrita no `contract.ts`; `writeProjectLists` deixa de apagar o que mais o editor guarda em `RECORTE_projeto`. Testes: 15 novos em `pasta-do-projeto.test.ts`, 1 em `acoes.test.ts`.

As duas notas da conferência do lote 1 (`28`): a **Prateleira** mostra também as outras bases do projeto (promover a espada não a esvazia mais), e o **tracejado é só do teste** (a entidade com o arquivo aberto ganhou borda cheia).

### v30.0 — A aba das entidades, lote 1: o projeto como cartão — 06/10/2026

Rodada 39, lote 1 do plano `22 A ABA DAS ENTIDADES`. Este lote só **mostra**: nada de teste ainda, nada muda no formato. Fotos em `backup/fotos-obra/rodada-39/lote1-1920/` e `lote1-1280/`.

| O que ele vê | Como |
|:---|:---|
| **Montagem**, em cima | caixa dentro de caixa, sem fio. O projeto aberto é um cartão com **moldura dupla** e a palavra **AQUI**. Dentro dele, uma linha por slot que tem entidade ou que foi marcado; a entidade é um cartão dentro da linha, com **borda cheia** e a palavra **PROJETO**, e o que ela toca (*"anima: idle"*, *"anima: livre"*, *"anima: a de quem recebe"*). Cada nível entra 12 px |
| As outras imagens | uma linha só: *"+ 22 outras imagens"*, e a dica diz como uma delas recebe uma entidade |
| Slot marcado | a linha mostra o que está **dentro** da base dele; sem nada, *"só a imagem"*; sem o arquivo, *"falta o arquivo"* (regra 21) |
| Animando a espada por dentro | o herói fica por fora (**EM VOLTA**), e a espada é o AQUI dentro da linha `weapon` |
| **Prateleira**, embaixo | as entidades do projeto, como antes: arrastar para a cena e o botão direito (Promover a base) continuam iguais |

Por dentro: `panels/entities-cards-model.ts` (a conta, sem DOM); a árvore desce até 8 níveis (spec 7.11) e para na volta sem fim. Testes: 10 novos em `pasta-do-projeto.test.ts`.

### v29.9 — Os consertos da fila, lote 11: o que mudou de cara — 06/10/2026

Rodada 17, parte 2, o último lote: os três que a conferência da v29.8 (`24 OS CONSERTOS DA FILA CONFERIDOS`) achou com outra cara. Fotos em `backup/fotos-obra/rodada-17/consertos/lote-11/`, em 1920×1080, 1440×900 e 1280×720.

| Id | O que ele vê |
|:---|:---|
| **N-16b** | A janela **Exportar imagem** cabe inteira nas três telas: o título em cima, os campos no meio (só o meio rola), e o **Andamento, a linha do que vai sair e os botões Exportar e Fechar sem exportar sempre à vista** embaixo. Medido: botões em y 878, 788 e 626, dentro das caixas que acabam em 900, 810 e 648 (antes: y 974 numa caixa até 900) |
| **K1b** | Com os Detalhes abertos, a aba **Imagens** tem chão: a tira, o cabeçalho e **uma fileira inteira de miniaturas** — e quem cede é a altura dos Detalhes, só enquanto estão abertos. Em 1920×1080 os Detalhes descem de 380 para 337 px, e a Imagens fica com a fileira inteira; a lista de Animações segue com três linhas. Em 1440×900 os Detalhes param no chão deles (240 px) e a fileira ainda corta; em 1280×720 nada muda (não há de onde tirar) |
| **L5** | Abrir o **Pincel** pela mão traz o grupo para o alto da aba Malha e pesos (antes ficava abaixo da dobra, embaixo dos Pesos) |
| *"peito_2" na Árvore* | **Não repetiu**: marcar, `Ctrl+Z`, marcar de novo, entrar e sair da base do slot — pelas duas portas, duas voltas — e a Árvore mostrou o `peito` uma vez só. Nada mudou no código |

Por dentro: o meio que rola (`dialog-rolagem`) em `io/export-image.ts` e `ui/dialog.css`; `dockRoomForColumn` e `IMAGES_ROW_NEED` em `ui/props-floor.ts`, e o chão da coluna em `fitToWindow` (`ui/shell.ts`); `bringBrushIntoView` em `panels/mesh-panel.ts`. Seis testes novos.

### v29.8 — Os consertos da fila, lote 10: o meio-termo — 05/10/2026

Rodada 17, parte 2, lote 10: PL-25, decisão do Diretor (05/10). Fotos em `backup/fotos-obra/rodada-17/consertos/lote-10/` (e as de 1280×720 do pivô e da Malha, em `lote-8/` e `lote-9/`).

| Id | O que ele vê |
|:---|:---|
| **PL-25** | **Editar → Pose** ganhou três itens: **Meio-termo**, **Meio-termo → anterior** e **Meio-termo → seguinte**. Na agulha, nos ossos escolhidos (nenhum = a pose inteira), nasce a chave entre a de antes e a de depois: no meio, a um terço ou a dois terços do caminho. Visto: torso em 0,25 s, entre 90 (0 s) e 93 (1 s), ganhou 91,5. O rodapé diz quantas chaves entraram; sem chave dos dois lados, diz que nada mudou. Um passo de desfazer |

É chave comum: nada sai do programa diferente do que sairia posando à mão.

Por dentro: `anim/breakdown.ts` (puro); as três ações na Linha do tempo, na tabela das ações e na tabela das tarefas. Três testes novos (`chaves`).

### v29.7 — Os consertos da fila, lote 9: Malha e pesos junto de Imagens, e a Prévia na barra — 05/10/2026

Rodada 17, parte 2, lote 9: a parte P (a tela). Decisões do Diretor (05/10). Fotos em `backup/fotos-obra/rodada-17/consertos/lote-9/`.

| Id | O que ele vê |
|:---|:---|
| **L12 + PL-30** | No arranjo de fábrica, a aba **Malha e pesos** mora no grupo de cima, ao lado de **Imagens e Pivôs**. Abrir a Malha não esconde mais a lista de **Animações** (as duas à vista juntas, na foto). O arranjo que a pessoa guardou **não muda**. A medição segue 90/90 e 81/90 |
| **PL-31** | Na barra de ações, depois da Imagem de referência, um ícone **Prévia** (uma tela com o ▶) que **abre** a aba Prévia — e não fecha se ela já estiver à frente. A mesma porta no menu: **Animação → Abrir a Prévia** |
| **M10** | Decidido que não muda: as ações da aba Skins ficam em ícone, com o nome na dica (a régua do Humberto) |

Por dentro: `RIGHT_GROUPS` em `ui/layout-model.ts`; o item `previa` em `ui/action-bar-model.ts`, o ícone `previa` em `ui/icons.ts`; `mostrar-painel-previa` entrou no menu Animação, na tabela das ações e na tabela das tarefas. Três testes novos (`colunas-e-barra`); dois testes que escreviam o arranjo de fábrica letra por letra (`ordem`, `paineis-do-photoshop`) e os dois da tabela das ações (`acoes`) seguem a decisão.

### v29.6 — Os consertos da fila, lote 8: o X e o Y da ficha de uma imagem são o pivô — 05/10/2026

Rodada 17, parte 2, lote 8. Decisão do Diretor (05/10), pelo Spriter. Fotos em `backup/fotos-obra/rodada-17/consertos/lote-8/`.

| O quê | O que ele vê |
|:---|:---|
| **O X e o Y da imagem com osso próprio** | São o **pivô** dela, como no Spriter. Digitar X = 40 e depois Escala X = 1,5 (ou Ângulo = 30): o X **fica 40** (antes: 50,5, porque o X era o centro da imagem, que anda quando ela escala em volta do pivô). O número digitado vai direto para o osso próprio |
| O rodapé da v29.1 | *"o centro dela andou"* saiu: o centro deixou de ser o número da ficha |

Uma imagem **sem** osso próprio continua mostrando o número do anexo dela; o primeiro X digitado numa animação faz nascer o osso próprio no pivô, e dali em diante a ficha mostra o pivô.

Por dentro: `imageNow` e `writeImageValue` em `panels/image-key.ts`; `centerMovedNotice` saiu. O teste da v29.1 deu lugar ao que prova o pivô (`paineis`), visto falhar antes (50,5).

### v29.5 — Os consertos da fila, lote 7: apagar uma skin de que outra depende — 05/10/2026

Rodada 17, parte 2, lote 7: a parte I (M12a). Fotos em `backup/fotos-obra/rodada-17/consertos/lote-7/`.

| Id | O que ele vê |
|:---|:---|
| **M12a** | Apagar a `armadura` pergunta citando **quem depende dela**: *"A skin "armadura_capa" inclui esta: perde o que vinha daqui, e a barra de avisos diz isso até ela voltar (importar a skin de volta religa)."* Depois de apagar, o botão do rodapé diz *"1 aviso — ver"*. A inclusão fica no arquivo de propósito: exportar, apagar e importar a skin devolve o arquivo letra por letra (M17) |
| **A mesma forma, no renomear** | Renomear a `armadura` troca o nome também no `includes` da `armadura_capa` (antes ela ficava incluindo um nome que não existia mais) |

Por dentro: `skinDependents` e `deleteSkinLead` em `panels/skins-model.ts`; `renameSkinIn` leva o `includes`. Três testes novos (`peles`).

### v29.4 — Os consertos da fila, lote 6: as boas-vindas, os Atalhos e a aba Regras — 05/10/2026

Rodada 17, parte 2, lote 6: as partes A (J11, PL-21) e C (PL-10). Fotos em `backup/fotos-obra/rodada-17/consertos/lote-6/`.

| Id | O que ele vê |
|:---|:---|
| **J11** | As boas-vindas dizem *"Arquivo → Abrir pasta **do projeto**… e arraste as peças"* — o nome que o menu tem. Os outros **dezenove textos** que mandavam para *"Arquivo → Abrir pasta…"* (avisos de Imagens, Pivôs, Entidades, Skins, bases) também. Um teste varre o editor e não deixa voltar |
| **PL-21** | Ajuda → Atalhos ganhou, embaixo da tabela, a seção dobrada **"Teclas dos painéis (35): Linha do tempo, Ordem e Árvore"**, com o painel, o que faz, a tecla e quando vale |
| **PL-10** | A aba Regras tem **Novo ▾** (Regra…, Parâmetro, Variável, Etiqueta) e **um Apagar**, que apaga o escolhido na lista (sem nada escolhido, o rodapé diz o que escolher). Eram doze ícones soltos, três deles lixeiras iguais; a barra ficou com sete |
| **De passagem** | A lista do **Novo ▾** abria com 102 px, e os nomes quebravam letra a letra — também na Árvore. Uma regra geral das colunas (lote 65) zerava a largura mínima dela. Agora 180 px, o nome numa linha |

Por dentro: `panelKeyRows` em `ui/key-swaps.ts`; `rulesDeleteTarget`, `RULES_NEW_ITEMS` e `RULES_DELETE_NOTHING` em `panels/rules-model.ts`; a regra da lista em `panels/panels.css`. Seis testes novos (`menus`, `teclas`, `regras`).

### v29.3 — Os consertos da fila, lote 5: a Prévia segue a animação aberta, e a ficha do evento — 05/10/2026

Rodada 17, parte 2, lote 5: G-Q4 (parte G) e D2 (parte B), dois pequenos numa versão. Fotos em `backup/fotos-obra/rodada-17/consertos/lote-5/`.

| Id | O que ele vê |
|:---|:---|
| **G-Q4** | Com uma animação aberta, a **Prévia a mostra**: a camada 0, enquanto ninguém escolhe outra, **segue a animação aberta** (*"— a animação aberta —"* na lista, *"Camada 0 — segue idle"* no título, e a frase embaixo do palco). Parada, mostra o quadro da agulha; com a linha do tempo tocando, anda junto. Escolher uma animação na camada 0 é a mão dele, e vale |
| **D2** | Escolher o evento `step` na Árvore abre a **ficha dele**, no alto de Propriedades, com *"Evento: step"* no título (antes: a ficha da Base, e a do evento no fim). A próxima escolha devolve a ficha de sempre |

Por dentro: `effectiveLayers` e `followNotice` em `panels/preview-model.ts`; `focusEvent`, `eventFocused`, `releaseEventFocus` e `onEventFocus` em `panels/event-key-editor.ts`. Quatro testes novos (`previa`, `arvore`).

### v29.2 — Os consertos da fila, lote 4: a janela Exportar imagem — 05/10/2026

Rodada 17, parte 2, lote 4: a parte E (arquivo, importar e exportar) do `23 A FILA CONFERIDA`. Fotos em `backup/fotos-obra/rodada-17/consertos/lote-4/`, em 1920×1080 e 1280×720.

| Id | O que ele vê |
|:---|:---|
| **N-16b** | A janela **abre no começo**: o título e a Animação à vista (o foco no Exportar rolava a janela até o fim) |
| **N-10** | A janela **lembra a escolha da vez passada** — formato, quadros por segundo, escala, fundo, recorte, cores, voltas, o .zip —, exportando ou fechando sem exportar. A animação abre a que está aberta, e o trecho volta inteiro |
| **N-5** | Antes de exportar, a linha de baixo diz **o que vai sair**, e se refaz a cada mudança: *"Vai sair: heroi.zip (60 PNG) — idle, 60 quadros a 30 por segundo"*. A recusa (De depois de Até) aparece antes do clique |
| **N-8** | O aviso do fim diz **a pasta**: *"Pasta: a de downloads do navegador (Ctrl+J abre a lista do que foi baixado)"* |

Por dentro: `exportPreviewLine`, `rememberImageOptions`, `withRememberedOptions` e `DOWNLOAD_FOLDER_LINE` em `io/export-image.ts`; o formulário da janela lido num lugar só (`readForm`). Quatro testes novos (`exportar-e-importar`).

### v29.1 — Os consertos da fila, lote 3: os oito pequenos — 05/10/2026

Rodada 17, parte 2, lote 3. As sobras das rodadas 9, 29 e 32 (o fim do `03`). Fotos em `backup/fotos-obra/rodada-17/consertos/lote-3/`.

| O quê | O que ele vê |
|:---|:---|
| **A janela das Rajadas** | O **Esc fecha**, de onde estiver o foco (antes, só com o foco dentro dela; o foco fica no botão "Rajadas ▾") |
| **O rótulo do Raio** | O nome da alça vai para **fora** da forma: ao arrastar o Raio, *"Raio: 53,03"* fica à esquerda da alça, longe da estrela do emissor |
| **A folha de quadros** | A linha de três números põe o rótulo em cima, e *qtd. · 1º · díg.* ganham a largura inteira: o último não corta mais |
| **Marcar como slot, depois `Ctrl+Z`** | Marcar de novo com o **mesmo nome** funciona (antes: *"Já existe … no projeto"*). O que fica guardado só para o refazer não prende o nome |
| **O nome da base-slot na lista de Bases** | Abre a base **por dentro, com o boneco à vista** — o mesmo da linha "slot" (antes, só a peça, sozinha) |
| **Caixa e ponto não viram slot** | O item cinza do menu que sabe **por quê** continua clicável, e o clique escreve o motivo no rodapé (*"hitbox não mostra uma imagem: só imagem vira slot"*). Vale para todo item cinza com motivo, em todo menu |
| **O nome do meio de "Este boneco"** | Com a peça girada, o nome fica **abaixo também das alças** da caixa do Transformar, inteiro |
| **A Escala X que muda o X** | Provado o que é: a imagem escala **em volta do pivô**, e o X da ficha é o **centro** dela, que anda. O desenho está certo. O rodapé passa a dizer: *"Escala X muda em volta do pivô da imagem: o centro dela andou (X 40 → 50,5)"*. Mudar o que o X quer dizer é pergunta ao Diretor |

Por dentro: `escDaJanela` em `panels/properties.ts`; `shapeLabelSide` em `viewport/emitter-shape.ts`; `takenBaseUris` e `isMarkedSlotBase` em `panels/slot-base-model.ts`; `greyItemSays` em `ui/menus.ts`; `aroundLabelAt` com as alças a evitar, em `viewport/viewport-draw.ts`; `centerMovedNotice` em `panels/image-key.ts`. Nove testes novos.

### v29.0 — Os consertos da fila, lote 2: o que não agia — 05/10/2026

Rodada 17, parte 2, lote 2. Os botões que não faziam nada, ou faziam calados (regra 21). Fotos em `backup/fotos-obra/rodada-17/consertos/lote-2/`.

| Id | O que ele vê |
|:---|:---|
| **L2 + L3** | Depois de **Pesos automáticos** (e de Suavizar e Podar) a ferramenta **Pesos (G)** entra na mão e a cena mostra a pizza de cada vértice. O rodapé diz o resultado: *"Pesos automáticos em 4 vértices. A ferramenta Pesos (G) ligou…"* (antes, só *"Pesos automáticos."*). A nota azul da aba some ao escolher outra imagem |
| **L5** | Quando a ferramenta Pesos entra na mão, a seção **Pesos** vem para o alto da aba Malha e pesos (antes, abaixo da dobra, só rolando) |
| **L1a** | Abrir o grupo **Pincel** põe o pincel na mão, e o rodapé diz como pintar. A aba passou a seguir a ferramenta na mão (o Pincel ficava aberto com a Malha na mão) |
| **L11b** | Sob os botões de Pesos: *"Testar: gire um osso ligado e veja a malha seguir. Ctrl+Z volta o último passo dos pesos"* |
| **J2** | Base → **Virar filho de…** abre o gesto do P **sem segurar a tecla**: cada clique prende ou solta, e o Esc termina. Sem janela de lista, como o Humberto mandou no lote 63a |
| **M13** | Ligar e desligar **Em todas as skins** (e *Trocar todas as iguais*) diz no rodapé o que mudou |
| **M15** | O botão direito sem ferramenta de antes diz o gesto, e não soa a erro: *"O botão direito volta à ferramenta de antes, e ainda não houve outra: segue Transformar"* |
| **I8** | Os grupos da aba **Exibição** dobram pelo título (▾/▸), com o clique, o Enter ou o Espaço |

Por dentro: `shouldTakeWeightsTool`, `weightsDoneNotice`, `WEIGHTS_TEST_HINT` e `BRUSH_TOOL_NOTICE` em `panels/mesh-panel-model.ts`; `openGrabFromMenu` em `viewport/tools/select.ts` e `grabMenuNotice` em `viewport/parent-gesture.ts`; `everywhereNotice` e `allSameNotice` em `panels/image-picker-model.ts`; `noToolBackNotice` em `viewport/tools/registry.ts`; o estado dos grupos dobrados em `panels/view-panel-actions.ts`. Dez testes novos.

### v28.9 — Os consertos da fila, lote 1: o que some da vista e o que perde trabalho — 05/10/2026

Rodada 17, parte 2, lote 1. Os itens da fila de 29/09 que ainda existiam na v28.8 (`23 A FILA CONFERIDA`), os piores primeiro. Fotos em `backup/fotos-obra/rodada-17/consertos/lote-1/`.

| Id | O que ele vê |
|:---|:---|
| **K13 + K1b** | Com os Detalhes da linha do tempo abertos, a lista de Animações **guarda três linhas** em 1920×1080 (antes: só `idle`). A régua é a do Propriedades: o grupo das Animações tem chão, e quem cede é o outro grupo da coluna. Duas cercas: só com os Detalhes abertos (fechados, nada muda), e nunca mais que metade da coluna. Em 1440×900 ficam duas linhas, em 1280×720 uma (antes, nenhuma). A tira de abas do outro grupo nunca é cortada |
| **G-Q6** | A aba **Curvas tem tocador**: Início, Quadro anterior, Tocar/Pausar, Quadro seguinte e o relógio (`0,50 s · quadro 15`), os mesmos botões da Linha do tempo. Toca-se olhando a curva |
| **K9 + G-Q5** | Os sete botões do **Formato da curva** subiram para a barra de cima da aba Curvas, numa fila só: à vista em 1920×1080 e 1280×720 (antes, de y 1078 a 1217, fora da tela) |
| **G-Q7** | A linha logo abaixo da barra diz o que fazer: *"Clique num ponto do gráfico (uma chave) para escolhê-la…"*; com o cursor sobre o gráfico, o tempo e o valor. Os botões de formato apagados dizem na dica por quê |
| **Achado da conferência** | **Tirar a skin pelo × da pilha entra no Desfazer.** Repetia: o `Ctrl+Z` desfazia o passo de antes e a skin ficava desligada. Agora *"Desfeito: Desligar a skin "default""* devolve a skin e a arte dela. Vale também para soltar uma skin na coluna Ativas e para o *Mostrar* da aba Exibição |

Por dentro: `animListNeed`, `animFloorCap` e `floorGroup` em `ui/props-floor.ts`; `CURVES_PLAYER_IDS` e `curvesClock` em `panels/dopesheet-model.ts`; o comando `ChangeSkinStack` (`takeOffSkin`, `putSkinStack`) em `panels/skins-actions.ts`. Nove testes novos (`paineis-do-photoshop`, `peles`).

### v28.8 — Dez casos novos escritos pela spec, e o que eles derrubaram — 05/10/2026

Rodadas 34, 35 e 35b. Nada mudou na tela do editor.

| O quê | |
|:---|:---|
| **A rodada 34: dez casos novos** | `C-264`, `C-322` a `C-326`, `P-027` a `P-029` e `X-308`, escritos **à mão, pela spec**, por um chat que não escreveu runtime, e rodados nos quatro leitores antes de qualquer conserto. Entraram em `casos/` neste fecho, com as três fontes; em `casos-pendentes/` ficou só o `P-002` |
| Quem caiu em quê | **TypeScript:** C-324, C-326, P-029. **Python:** C-326, P-027. Os outros cinco passaram de primeira nos dois |
| **A rodada 35: o TypeScript** | **C-324** — o slot do meio de um filho com `around`, quando mostra um neto com `around` próprio, perdia o neto inteiro; agora some só o meio do neto, e a parte de trás e a da frente dele continuam (a cebola, por composição; `runtime/src/render-list.ts`). **C-326** — a chave `reset` da física dentro da animação de uma entidade não disparava; agora dispara no relógio do filho, antes da física do quadro (`runtime/src/nested.ts`). **P-029** — um emissor de forma desconhecida entrava na `drawList`; agora fica de fora, e o aviso do loader continua (regra 21) |
| **A rodada 35b: o Python** | C-326 e P-027, consertados pelo chat do Python |
| A spec | **§9.8:** o `physicsReset` de uma chave roda **antes** do `physicsApply` do mesmo quadro, e vale dentro do filho. **§7.7:** o slot marcado com `around` continua na volta do clipping, e a máscara de quem o recebe acaba nele (C-323). **§7.11 e §7.13:** o filho com `around` próprio no slot do meio (C-324). O `leiame` do C-262 descrevia a ordem do `reset` ao contrário; o número sempre foi o certo, e o texto foi corrigido |

Por dentro: o teste das ferramentas (`particulas.test.ts`) ganhou os P da rodada 34 na lista; o P-029 conta só na pasta, porque mede a `drawList` e a entrada dele traz de propósito uma forma que o schema recusa. O pacote do Construct remontado. **O leitor do Godot fica em 119 de 120** até copiar o conserto do C-326 do Python.

### v28.7 — As armas e as rodas: "Trocar todas as iguais" — 05/10/2026

Rodada 9, lote 2. As palavras do Humberto (fim do `03`): duas armas com a mesma entidade trocam **separadas**; as duas rodas, ele quer a **possibilidade** de trocar de uma vez.

| O que ele vê | |
|:---|:---|
| **Separadas, por padrão** | botão direito numa das peças, clicar noutra imagem ou entidade: só ela troca (já era assim; conferido no uso) |
| **"Trocar todas as iguais (N)"** | na grade do botão direito, quando o boneco tem outras peças com a mesma entidade, com o número (o herói com duas espadas soltas: 3, contando a da mão). **Desligada** ao abrir a grade |
| **Ligada** | o que se clicar troca em todas as peças iguais, cada uma no lugar dela, com as chaves dela. **Um Ctrl+Z** desfaz todas. O rodapé diz quais: *"3 peças iguais voltam a mostrar a imagem "hair": weapon, espada, espada2"* |

Conta as peças na **mesma skin** da peça clicada. Sem campo novo no formato.

### v28.6 — Marcar a imagem como slot: ela vira base — 05/10/2026

Rodada 9, lote 1. A decisão do Humberto (`02`, seção 2, regra 2): *"eu marco uma imagem como slot, e ela vira uma base dentro do projeto. Ganha nome (fácil de achar) e animações próprias."*

| O que ele vê | |
|:---|:---|
| **Entidades → Marcar como slot…** e o **botão direito** na imagem | pergunta o nome (o da imagem, sugerido). A imagem vira a base `<nome>.bone` do projeto, e o slot passa a se chamar assim: a **Árvore**, a **Ordem** e a **lista de Animações** ("cabelo · slot") mostram o nome dado |
| **Nada muda no desenho** | o mesmo lugar, a mesma ordem, as mesmas chaves. Conferido **pixel a pixel** na cena do herói |
| **Clicar no nome dela na lista** | abre a base dela por dentro, com o boneco montado em volta, parado; clicar numa animação do boneco volta |
| **Desmarcar o slot** (menu e botão direito) | a imagem de antes volta, como era, com o nome de antes; a base sai do projeto. **Ctrl+Z** devolve o arquivo letra por letra |

Sem campo novo no núcleo: a base é um `.bone` do projeto e, no boneco, um anexo `skeleton` (7.11). A marca (o nome e o slot de antes) mora no `RECORTE_editor_state` do anexo. **Só imagem simples**: malha, ponto, caixa e entidade recusam, e o item diz por quê. O `darkColor` e o `blend` do slot vão para o slot de dentro, porque a cor escura não passa do pai ao filho (7.11): sem isso, o contorno do cabelo do herói mudava. **As chaves de cor escura do slot**, se houver, ficam no slot do boneco e deixam de valer para a imagem: o herói não tem nenhuma.

### v28.5 — O programa pede a pasta ao começar o projeto, como o Spriter — 05/10/2026

Rodada 7. A decisão do Humberto: *"o programa pede uma pasta ao começar o projeto, como o Spriter"* (no manual do Spriter: `File / New Project`, escolher a pasta raiz; o `.scml` mora nela).

| O que ele vê | |
|:---|:---|
| **Arquivo → Novo projeto…** | pede a pasta **antes** do projeto vazio. As imagens dela vão para a aba Imagens, e o projeto nasce com o nome da pasta |
| **Salvar** | com o projeto numa pasta, grava `<pasta>.bone` ali, **sem perguntar**. Se a pasta já tem um `.bone` que ninguém abriu, a janela do Salvar abre (na pasta) em vez de pisar nele |
| **A pasta já tem projeto** | o Novo projeto pergunta: *Abrir* o que está lá, *Começar um novo ao lado* (`boneco2.bone`, o outro não é tocado), ou *Cancelar* |
| **O programa vazio** | o primeiro **Ctrl+S**, ou a primeira **imagem solta na janela**, pede a pasta numa janela (*Escolher a pasta do projeto…*, ou o caminho de antes, ou *Cancelar*). Escolhida a pasta, o trabalho fica e as imagens soltas entram junto |
| **Cancelar** | nada muda, e o rodapé **diz**: *"Novo projeto: nenhuma pasta escolhida. Nada mudou, e o projeto continua sem pasta"* |
| **O "Próximo:" do rodapé** | com a pasta aberta deixou de mandar *"traga as imagens — Abrir pasta"*: as imagens da pasta agora contam (antes só contavam as importadas e o atlas) |

A decisão é pura e testada (`editor/src/io/pedir-pasta.ts`, 8 testes em `pasta-do-projeto`). **O seletor de pasta do Windows não abre num Chrome sem janela**: as fotos usam uma pasta de mentira na memória; a janela de verdade só a mão do Humberto prova. Navegador sem pasta com escrita (Firefox): o Novo projeto continua como antes e o rodapé diz que o projeto está sem pasta.

### v28.4 — Partículas ao longo de um caminho, e os consertos da segunda conferência — 05/10/2026

Rodada 16: o lote 7 (o formato e o runtime TypeScript), o lote 7b (o runtime Python) e o lote 8 com os sete consertos (o editor). Três chats, uma versão.

| O que ele vê | |
|:---|:---|
| **A forma Caminho** (lote 8, chat das partículas) | o emissor nasce **ao longo de um caminho** do boneco, espalhado por igual no comprimento: o botão na escolha de Forma, a lista dos caminhos do arquivo, o caminho em destaque na cena e o aviso quando ele não existe |
| **Os sete consertos da segunda conferência** (chat das partículas; os defeitos em `documentos/projeto do programa/19 AS PARTICULAS CONFERIDAS - segunda parte`) | a janela das Rajadas · a linha de Emitindo à vista · o nome das alças · a aba que cortava em 1280×720 · a folha de quadros · a dica da curva · o teto. O detalhe de cada um é do chat que os fez |
| **Recarregar o arquivo no mesmo desenhador desenha o arquivo novo** | o desenhador guardava a curva de emissão pelo **nome** e nunca a esquecia: mudar a taxa e recarregar dava 0 px de diferença. Agora guarda pelo próprio objeto (lote 7) |
| **Entidade** | as duas mensagens de profundidade máxima dizem "Entidade passou da profundidade máxima", e não "Esqueleto aninhado" |

**O formato — extensão `BONE_particles` 1.1** (lote 7):

| | |
|:---|:---|
| `shape: "path"` e o campo `curve` | `"<slot>/<anexo>"` de um anexo `path` de **qualquer** slot; o slot é o que vem antes da primeira barra. A conta está na §9.4.2: sempre por **comprimento**, na poligonal de **10 segmentos** por curva, com o caminho lido em `t_i`. O `constantSpeed` e o `lengths` do caminho não são lidos |
| O passo 7 | o ponto do caminho (e da malha) volta ao referencial do emissor **nos dois espaços**; daí é um `p0` como o de qualquer forma. O `spherizeDirection` mede a partir da **origem do emissor** |
| Validador | L1 `REF_PARTICLE_CURVE`: `curve` não aponta para um anexo `path`. Schema com `"path"` e `curve` |
| Leitor 1.0 | `"path"` é forma desconhecida: **não desenha e avisa** (§7.4). Ninguém desenha errado calado |
| Casos | **P-021 a P-026**, a conta à mão no `leiame` de cada um, vistos vermelhos antes do código. Três fontes: a conta, o TypeScript e o Python (este escrito só pela spec) |

**Um defeito que mudou número: a malha em `world`.** O runtime TypeScript levava o ponto de `shape: "mesh"` ao esqueleto **duas vezes** em `space: "world"` (o ponto já vinha no esqueleto, e a §7.2 o levava de novo). O P-026 pegou o mesmo erro no caminho, e o conserto vale para os dois. **Nenhum exemplo do formato nem o herói usa malha em `world`**: nenhum desenho de exemplo mudou. O runtime Python já fazia certo.

Por dentro: `runtime/src/particles/emitter.ts` (`samplePath`, `backToEmitter`, `pathSilence`), `bone-poser.ts` (`pathFor`), `frame.ts` (o `ParticleCache` por identidade, com a pilha de peles na chave do poser), `attachments/particle.ts` e `loader.ts` (`curve`), `ferramentas/src/conformidade/pose-dump.ts`; `site/validador/nucleo.js` e o `esquema-compilado.js` remontado; o `runtime-python/` (lote 7b); o pacote do Construct remontado. O teste do leitor do Construct deixou de contar "19 casos P": conta os que existem e exige todos.

### v28.3 — Emitindo na linha do tempo, e a folha de quadros do emissor — 05/10/2026

Rodada 16, lote 9.

| O que ele vê | |
|:---|:---|
| **Emitindo vira chave** | numa animação aberta, desmarcar (ou marcar) a caixa **Emitindo** na aba Nascer grava uma chave no tempo da agulha — e a chave do começo nasce junto, com o valor da base, para o antes ficar como estava. Na base (sem animação) a caixa continua mudando o emissor |
| **A linha na linha do tempo** | grupo *"Emissor <slot> / <emissor>"*, linha **Emitindo**. As chaves se apagam, se copiam, se colam e se arrastam como as outras |
| **A agulha para trás devolve o mesmo desenho** | medido na tela: com a chave de desligar em 0,5 s do idle, 0,9 s tem 15 partículas vivas (32 sem a chave); ir a 0,3 s e voltar a 0,9 s dá as mesmas 15, nas mesmas posições, e a cena idêntica pixel a pixel |
| **A folha de quadros** (aba Imagem) | *Folha de quadros*: quadros · primeiro número · dígitos, numa linha. A imagem de cada quadro é o nome da partícula mais o número (`fx/chama_` com 8 quadros, começando em 1, 2 dígitos: `fx/chama_01` a `fx/chama_08`). Zero quadros tira a folha do arquivo |
| Sem folha, os campos dela esperam | "A folha corre", "Voltas na vida" e "Quadro inicial" só aparecem com a folha: sem ela não mudavam nada |

Por dentro: o endereço `BONE_particle` em `anim/keying.ts` (`targetForPointer` do ponteiro `…/emitting`, `setupPointerFor`, o padrão `true`, o grupo "Emissor", o rótulo "Emitindo"; a timeline nova leva o `skin` sempre, como a extensão escreve) · `sequenceFields` e `sequenceCommand` em `properties-model.ts` · uma linha da ficha com três campos. **Nada no `runtime/`**: o formato e os dois runtimes já liam a chave (§4.1, casos P-016 e P-017). 4 testes novos, e 2 do lote 1 reescritos de propósito (os campos da folha agora esperam a folha); regra 26: o ponteiro do Emitindo desligado dá 3 vermelhos.

### v28.2 — O selo de peso do emissor — 05/10/2026

Rodada 16, lote 6.

| O que ele vê | |
|:---|:---|
| **O selo, na frente do título da ficha** | uma **palavra** e um número: *leve · 40*, *médio · 100*, *pesado · 400* — o número é de partículas **vivas** de uma vez. A cor só reforça a palavra |
| Os limites | por emissor: leve até 60, médio até 150, pesado acima. Pelo boneco inteiro (a soma): 100 e 300 |
| **A dica diz de onde vem a conta** | a taxa vezes a vida, mais a pior janela de rajadas, até o Máximo de vivas; no Godot ~50 µs por partícula, e quantos ms por quadro custa; o boneco inteiro |
| **A barra de avisos** | o emissor pesado e o boneco pesado entram na lista, com o número e o que fazer. O médio fica só no selo |
| **Avisa, nunca impede** | nada é recusado |

Por dentro: `panels/particle-weight.ts` (novo, puro: `emitterLiveEstimate`, `emitterWeight`, `skeletonWeight`, `weightHint`, `weightWarningLines`) · `PropertiesModel.weight` · a linha nova em `allWarnings` do `shell.ts`. 4 testes novos; regra 26: a janela das rajadas com `>` em vez de `>=` dá vermelho.

### v28.1 — Curvas, gradiente e rajadas do emissor; e os seis consertos da conferência — 05/10/2026

Rodada 16, lotes 4 e 5, e os consertos de `documentos/projeto do programa/18 AS PARTICULAS CONFERIDAS 2026-10-05.md`.

**Lote 4 — curvas e gradiente**

| O que ele vê | |
|:---|:---|
| **Tamanho na vida** e **Some na vida**: uma curva na ficha | da esquerda (nasce) à direita (morre). Clique põe ponto, arrastar move, botão direito tira; ▾ com prontas (cresce, encolhe, pulsa · some no fim, aparece e some…). Desenhada pela conta do runtime. Grava ao soltar: um passo no desfazer |
| **Cor na vida**: o gradiente | clique põe uma cor (a que já estava ali), arrastar move, duplo clique troca a cor (o alfa fica), botão direito tira; as pontas ficam |
| **Cor do emissor** | o `color` do anexo, que multiplica tudo |
| **O nome da forma escrito** | embaixo dos nove botões: *"Forma: anel — nasce na borda do círculo"* |
| **Dez abas** | Tamanho e giro, e Cor, separadas; a curva conta duas linhas. Cabe nas três telas (30 de 30) |

**Lote 5 — rajadas**

| O que ele vê | |
|:---|:---|
| **Rajadas** na aba Nascer | uma linha (*"2 rajadas · 20 partículas ▾"*) que abre a lista numa janelinha: Quando, Quantas, Vezes, A cada, Chance; + e lixeira; Esc fecha. Os números ficam nos limites do schema. O atraso foi para Tempo, e "Explosão · janela" divide uma linha |

**Os seis consertos da conferência**

| # | O conserto | Provado |
|:---:|:---|:---|
| 1 | Retângulo (60 × 40), linha (−30…30) e círculo (raio 30) nascem com tamanho que se vê — só quando o de agora é zero | teste; foto |
| 2 | Digitar e puxar são passos separados no desfazer | com teclado e mouse na tela: 80 × 40 digitado, puxado a 100 × 50, **um** `Ctrl+Z` volta a 80 × 40 |
| 3 | Círculo: só o raio · anel: raio e espessura · arco: os três | teste |
| 4 | A alça do trecho só no arco; cada alça diz o que puxa ao passar, e o rodapé diz o número enquanto arrasta (*"Retângulo: 100 × 50"*) | na tela |
| 5 | **A Taxa não mudava a cena.** Não era o teto: o desenhador do runtime guarda a curva de emissão pelo NOME e nunca a esquece (`runtime/src/render/canvas.ts`). A cena agora troca de desenhador quando o arquivo muda. **Taxa 40 → 200: 0 px antes, 17.089 px depois**, medido na tela. E quando o teto corta, a ficha diz, com o número (*"Teto corta 220"*, a frase na dica) | pixels; teste |
| 6 | Criar outro emissor no mesmo osso avisa, com os nomes; o Espaço diz "do emissor" / "do mundo", e a frase inteira vai na dica | teste |

Por dentro: `panels/life-curve.ts` e `panels/burst-list.ts` (novos, puros) · `FieldKind` ganha `lifeCurve`, `lifeGradient`, `bursts` · `circleVariant`, `capCutting`, `shapeNameLine` em `particle-sheet.ts` · `renewsParticleCache` em `particles-view.ts` · `emittersOnBone` em `particle-presets.ts`. 20 testes novos; regra 26 em cada um dos lotes (a curva sem degrau, o `count` sem trava, o desfazer sem fechar a junção, a cena sem renovar).

### v28.0 — A forma do emissor na cena, com alças — 05/10/2026

Rodada 16, lote 3.

| O que ele vê | |
|:---|:---|
| **Escolhido um emissor, a cena desenha de onde as partículas nascem** | círculo · anel (o círculo de dentro, tracejado) · arco (a fatia) · retângulo · linha · osso (tracejado, do comprimento do osso) · malha (os triângulos, tracejados). Na cor da escolha, com o contorno claro por baixo, como a estrela |
| **Alças** (quadradinhos) | raio (no meio do arco), anel (por dentro), fim do arco, canto do retângulo, as duas pontas da linha. O rodapé diz o que a alça muda ao apertar |
| **Arrastar grava aquele número, e só ele** | e o arrasto inteiro é **um** passo no desfazer. Provado com o mouse na tela: raio 30 → 40, um `Ctrl+Z` volta a 30 |
| **A alça não rouba a estrela** | com raio 0 ou retângulo 0×0, a alça fica na borda da estrela; a ponta da linha que está na origem fica sem alça (digita-se no campo). A estrela continua sendo onde se clica para mover |
| Osso e malha | só o desenho, sem alça: o comprimento é do osso, e a malha se edita na Malha |

Por dentro: `viewport/emitter-shape.ts` (novo, puro: o contorno e as alças no mundo, pela `M_emissor` da §9.10, e a conta de cada alça) · `drawEmitterShapes` em `viewport-draw.ts` · o arrasto no `viewport.ts`, antes de qualquer ferramenta, como as alças de regra. 6 testes novos em `cena.test.ts`; regra 26: o raio de dentro do anel estragado dá 2 vermelhos.

### v27.9 — O seletor de forma do emissor, com os nove desenhos — 05/10/2026

Rodada 16, lote 2.

| O que ele vê | |
|:---|:---|
| **Nove botões na aba Forma**, cada um com o desenho e o nome na dica | ponto · retângulo · círculo · anel · arco · linha · osso · malha · caminho. O da forma de agora fica aceso |
| **Anel e arco** | não são formas novas no arquivo: gravam o círculo com valores de partida (anel: espessura 0,2; arco: 90°). O arco acende antes do anel |
| **Trocar não apaga** | só se grava o que o botão diz: voltar ao círculo devolve o raio de antes |
| **Cinza diz por quê** | malha, quando o slot não tem malha; caminho, até o lote 7 da rodada (a forma nova no formato). O clique no cinza avisa na barra, e a forma não muda |
| **Um passo no desfazer** | o anel grava três campos; `Ctrl+Z` volta o arquivo letra por letra |
| **A linha ganhou campos** | Início X·Y e Fim X·Y. Antes a forma "linha" se escolhia e tudo nascia em (0,0), sem a tela dizer por quê |

Por dentro: `shapeButtons` e o comando `ChooseShape` em `panels/particle-sheet.ts` · `edgeFields` e `edgeFieldCommand` (a linha se grava inteira, como a faixa) · `FieldDef.component` vai de 0 a 3 · 6 ícones (`forma-*`). 5 testes novos; regra 26: a ordem anel/arco trocada dá vermelho. Medição: a ficha do emissor continua 27 de 27.

### v27.8 — A ficha do emissor em abas, sem rolar — 05/10/2026

Rodada 16, lote 1. Plano: `documentos/projeto do programa/16 AS PARTICULAS - o plano 2026-10-05.md`.

| O que ele vê | |
|:---|:---|
| **A ficha do emissor em 9 abas com ícone** | Nascer · Tempo · Lugar · Forma · Movimento · Forças · Tamanho, giro e cor · Imagem · Mais. O nome da aba está na dica do ícone e na frente do título do painel (*"Forma · Emissor: fogo"*) |
| **Nenhuma aba rola** | no máximo 5 linhas por aba; cabe nas três telas, 1280×720 inclusive (o painel ali tem 187 px) |
| **Só o que vale aparece** | a aba Forma mostra só os campos da forma escolhida (raio, anel e trecho só no círculo; largura e altura só no retângulo; malha só na malha); pré-aquecer só sem repetir; voltas ou quadros por segundo conforme a folha corre. Nada some: o resto está a um clique |
| **Faixa numa linha** | Vida, Velocidade, Gravidade, Tamanho, Giro, Quadro inicial: mínimo e máximo lado a lado; as duas cores ao nascer também |
| **Rótulo curto, o inteiro na dica** | *"Emitindo"*, *"Abertura (±°)"*, *"Pré-aquecer (s)"*… — a explicação que o rótulo levava (*"só sem repetir"*, *"p/ cada lado"*) está na dica |
| **A Ficha rápida mora na aba Lugar** | X, Y, Ângulo (com o disco) e Alfa, mais o Osso. Sem o slot escolhido, a aba mostra X·Y e Giro no lugar dela |
| **O bloco Chave de evento** não aparece embaixo da ficha do emissor | ele empurrava a ficha para fora; aparece com qualquer outra escolha |

| O número | |
|:---|:---|
| A ficha velha (sem abas) | pedia **2.953 px**; o painel tem 309 (1440×900), **187** (1280×720), 431 (1920×1080) |
| A nova | cada aba pede o que o painel tem: **27 de 27 cabem** |
| Primeira tentativa, 6 linhas por aba | 1280×720: cinco abas passavam de 3 a 45 px. Achados pela foto: os ícones saíam **vazios** (o flex encolhia o desenho até um ponto), o 9º botão saía da coluna, rótulos quebravam em duas linhas, e o nome da aba no fim do título quebrava o título |

Por dentro: `panels/particle-sheet.ts` (novo, puro: decide aba e linha; `LINHAS_POR_ABA = 5`, um número só) · `PropertiesModel.tabs` · `FieldDef.hint` · 5 ícones (`relogio`, `formas`, `trajeto`, `forca`, `gota`) · **a 3ª passada do `medir-paineis.mjs`**: o emissor do modelo fogo, aba por aba, também em 1920×1080, com *"pede N px, o painel tem M px"*; `--so-emissor` roda só ela. 8 testes novos em `paineis.test.ts`; regra 26: o filtro da forma estragado dá 2 vermelhos.

### v27.7 — Dez consertos da conferência, e os 14 casos promovidos — 05/10/2026

| O que ele vê | |
|:---|:---|
| **O painel Propriedades de baixo**, numa animação | Rotação, Posição X/Y e Escala de uma imagem viram **chave do osso próprio**; sem ele, o osso nasce no pivô, no mesmo Ctrl+Z. A base não muda. Com a base aberta, vai para a base |
| **A ficha rápida lê o que se digitou** | na imagem com osso próprio, X, Y, Ângulo e Escala são os DA IMAGEM: digita 25, lê 25 (lia 7, o pivô) |
| **O painel Pivôs** | a imagem que é sequência (a mão) leva o painel ao primeiro quadro dela; com um osso escolhido ele fica na última imagem e diz *"· a última imagem escolhida"* |
| **"Este boneco" no botão direito** | é o **primeiro** item, acima das miniaturas. Com a marca ligada, em qualquer imagem de dentro: **Tirar o Este boneco** primeiro, e **Este boneco: o meio passa a ser esta** quando a clicada não é o meio |
| A aba **Ordem** | a linha de zero peças (*"espada · na frente (0)"*) não aparece mais |
| O **nome do meio** na cena | vai para baixo do contorno tracejado, longe das alças do Transformar |
| **As palavras** | "entidade" na dica do mini-ícone, no aviso *"A entidade … não foi aberta"* e nos quatro avisos do runtime (`runtime/src/file.ts`, `nested.ts`, só o texto); *"O manifesto do projeto gravado"*, no singular |
| **Os 14 casos** | `C-263`, `C-310` a `C-321` e `X-307` saíram de `casos-pendentes/` para `casos/`: **104 de 104** nos dois runtimes, o confronto concorda campo a campo, e o pacote do Construct também dá 104 |

Já na v27.5 (feitos aqui, conferidos lá): o pivô à mão lido depois de salvar e reabrir; a janela do pivô dizendo que o desenho fica parado; o painel Pivôs seguindo a escolha; o Ângulo da ficha virando chave.

O "poder52" da conferência (`15 ESTE BONECO`, defeito 5) não se repetiu: soltar uma entidade cria um slot só, e o nome `poder52` é o da **segunda** soltura do mesmo arquivo (teste novo em `pasta-do-projeto`). A suspeita é o arrasto por protocolo da conferência entregar a soltura duas vezes.

### v27.6 — "Este boneco" no editor, o leitor 1.1 e o Python — 05/10/2026

Fechada pela rodada 11, com o trabalho de dois chats. Decisão do Humberto (`02 AS DECISOES`, seção 2): *"O poder rosa foi feito para receber o personagem. Mas eu estou animando o personagem e quero pôr o poder nele."* O plano e as contas estão em `documentos/projeto do programa/12 ESTE BONECO - o plano 2026-10-05.md`.

**1. Rodada 11, lote 4 — "Este boneco" no editor:**

| O que ele vê | Antes |
|:---|:---|
| **Entidades → Este boneco…**, com a entidade escolhida: pergunta qual imagem dela marca o meio (cada linha diz quantas ficam atrás do boneco e quantas na frente). O que está atrás dessa imagem vai para trás do boneco **inteiro**, o que está na frente vai para a frente, e ela não é desenhada | a entidade só entrava em bloco, no lugar dela na ordem |
| **Botão direito numa imagem de dentro da entidade**, na cena: **Este boneco** é a primeira das opções. Na imagem que já é o meio aparece **Este boneco ✓**, e clicar tira | o clique na entidade não dizia em qual imagem de dentro tinha sido |
| **Entidades → Tirar o Este boneco**: ela volta a ser desenhada em bloco | — |
| Na **base** vale em todas as animações. Com uma **animação aberta**, só nela, da agulha em diante — e a animação da entidade **não recomeça** no quadro da troca | — |
| Com a peça escolhida, a cena risca o **contorno tracejado** da imagem do meio, com o nome | — |
| A aba **Ordem** ganha duas linhas presas: *"poder · na frente (2)"* em cima, *"poder · atrás (2)"* embaixo. Não se arrastam; a dica explica | — |
| O **clique** pega o que está desenhado por cima. O meio, que não é desenhado, só pega o clique com a peça escolhida | o clique procurava a entidade no lugar do slot |
| O rodapé diz o que foi feito: *"poder em volta de heroi: 2 atrás, 2 na frente. A imagem "meio" marca o meio e não é desenhada"* | — |
| A barra de avisos diz quando o slot do meio **não existe mais** na entidade (ela foi mexida por dentro): a peça está em bloco, e por quê | — |

Por dentro: um `Command` só, `SetEntityAround` (`editor/src/anim/entity-around.ts`), que desfaz devolvendo o arquivo letra por letra. Na base grava o campo `around` no anexo; numa animação cria um segundo placeholder no mesmo slot e a chave `slot/attachment`. **O `minVersion` só sobe para 1.1 quando o campo existe**, e volta quando a última marca sai; um projeto sem `around` salva byte a byte igual. O clique anda pela ordem em volta (`collectDrawGroups`) e devolve a imagem de dentro (`Pick.inner`, `nestedHit`, em `viewport/picking.ts`).

**2. O leitor conhece a 1.1** (`runtime/src/loader.ts`, `READER_VERSION`): o runtime já lia o `around` desde a v27.5 e continuava dizendo que só conhecia a 1.0 — todo arquivo com "Este boneco" abriria certo **e** com o aviso de "best effort". Um arquivo 1.2 continua avisando.

**3. Rodada 11, lote 3 — o runtime Python** (outro chat, escrito **só pela spec**, sem abrir o TypeScript; relato do Diretor): `runtime-python/` ganhou a lista de desenho que entra no filho (`draw_list.py`), o `around`, o canal `drawList` e o relógio que continua na troca de placeholder com a mesma `uri`.

**Conformidade.** Em `conformidade/casos/`: **90 de 90** nos dois runtimes, e o confronto campo a campo igual. **Os 14 casos novos (C-263, C-310 a C-321, X-307) continuam em `casos-pendentes/` e passam nos dois runtimes**, com o confronto igual (15 de 15 na pasta, contando o P-002), medido às 11h56. **Não foram promovidos neste fecho**: um teste do leitor do Construct lê dez deles dessa pasta, e movê-los agora o quebraria. Sobem no fecho seguinte.

| Números | |
|:---|:---|
| Testes | **5.096** em 91 arquivos (5.066 passam, 29 pulados, **1 vermelho**: o do manual, de 15/09). Medido às 11h59, com o chat do leitor do Construct escrevendo em `leitor-construct/` (três testes dele entraram entre as 11h56 e as 11h59). Da rodada 11 neste fecho: +18 no editor, +1 no runtime |
| `tsc` do editor | limpo |
| Roteiro | 14 de 14, console limpo (11h57) |
| Painéis | 30 de 30 de lado, 21 de 30 de altura (11h58): igual à v27.5 |

Testes reescritos, pelo nome: `acoes.test.ts`, as duas contagens (285 → 287 e 117 → 119) · `cena-selecao.test.ts`, *"o clique na lâmina ACHA a entidade"* (o acerto ganhou `inner`) · `cena.test.ts`, *"a cena registra as duas, e as duas chamam o mesmo caminho do gesto"* · `existir-nao-e-funcionar.test.ts`, a contagem das cinzas (43 → 45). As duas ações novas ganharam nome de tarefa em `ferramentas/provas/tarefas.ts`.

**O addon do Construct** já estava remontado com o runtime novo (pelo chat da rodada K5, às 11h53; conferido no arquivo: `READER_VERSION` 1.1).

**O que fica de fora, às claras:** os 14 casos por promover, e com eles os textos que ainda dizem "71 de 71" e "90 casos" · três cantos que a spec não diz e não têm caso (o slot marcado que é o `end` da máscara de quem recebe; o slot do meio que mostra um filho com `around` próprio; emissor de forma desconhecida na `drawList`) · a física do filho continuando na troca de placeholder não tem caso · na aba Ordem a peça em volta continua também na linha dela.
### v27.5 — Os consertos dos painéis, do pivô, e "Este boneco" no formato — 05/10/2026

Fechada pela rodada 4, com o trabalho de três chats. Cada parte responde pelo que é seu.

**1. Rodada 4 — os consertos dos painéis** (o que a conferência da rodada 24 achou; `documentos/projeto do programa/11 OS CONSERTOS E OS PAINEIS CONFERIDOS 2026-10-05.md`):

| O que ele vê | Antes |
|:---|:---|
| **Janela → Arrumar → Soltar o painel da parede** solta o painel da coluna em que a mão esteve por último. Com a Árvore em uso, sai a Árvore | saía sempre um painel da direita. **Fechar o grupo** tinha a mesma forma, e ganhou o mesmo conserto |
| O **canto** do painel solto segue um arrasto rápido até a borda | crescia 38 px e parava |
| O **Sobre** diz a versão do programa: **v27.5** | dizia a anterior |
| Com o emissor escolhido, a primeira seção de Propriedades se chama **Emissor** | "ANEXO" |
| Abrir um `.bone` sozinho, sem o atlas: *"**Esta base usa** heroi.atlas.json…"* (e o aviso irmão do pacote) | "Este esqueleto usa…" |

Por dentro: `ladosPorUso` (`ui/layout-model.ts`); o canto escuta pela janela e larga no `pointerup`, `pointercancel` e `blur`; **`python ferramentas/montar-programa.py 27.5`** passa o número ao build (sem número, como antes; recusa número já guardado, testado rodando o Python), e passou a regravar o LEIA-ME sem trocar o fim de linha. **Três testes de outros arquivos reescritos de propósito**, pelo nome: `paineis.test.ts` › *"tem os grupos da 1ª fase…"* e *"a ficha acha o emissor numa pele que NÃO é a default"* (Anexo → Emissor); `arquivo.test.ts` › *"o aviso diz o gesto inteiro…"* (esqueleto → base). Fotos dos cinco nas três telas (1920×1080 incluída) em `backup/fotos-obra/rodada-04/consertos/`.

**2. Rodada 13 — quatro consertos do pivô** (relato do Diretor; as fotos são do conferente): o pivô à mão é lido depois de reabrir · a frase da janela · o painel Pivôs segue a escolha · digitar X, Y, Ângulo ou Escala de uma imagem numa animação cria a chave. +4 testes (`pivo.test.ts`, `ferramentas.test.ts`).

**3. Rodada 11 — "Este boneco", lotes 1, 2 e 2b** (relato do Diretor): o campo `around` no formato e no runtime TypeScript; o relógio do filho continua na troca de placeholder com a mesma `uri`; o executor de conformidade reprova canal que não conhece; **14 casos novos em `conformidade/casos-pendentes/`** (passam no TypeScript; 12 ainda não passam no Python, que é o próximo lote de outro chat). +11 testes (`runtime/testes/aninhado.test.ts`, `ferramentas/testes/conformidade.test.ts`).

**O addon do Construct foi remontado com o runtime da v27.5** (`npm run leitor:construct`, com o sim do Diretor): o `runtime/` mudou na rodada 11, e o `leitor-construct/testes/pacote.test.ts` acusou o pacote velho. Conformidade sobre o pacote novo: 90 de 90. **Um arquivo com `around` ele desenha em bloco** (o recuo da especificação) até a rodada K5. O addon de antes está em `backup/leitor-construct-saida_2026-10-05_11-10_…/`.

| Números | |
|:---|:---|
| Suíte | **5.043** (+23 sobre a v27.4: 8 da rodada 4, 4 da 13, 11 da 11): 5.013 passam, 29 pulados, 1 vermelho, o antigo do manual · 11h11 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 (`casos/`) · 14/14 · 30/30 e 21/30 · 11h11 a 11h13 |
| `programa/` | montado com `montar-programa.py 27.5`: o Sobre e o LEIA-ME dizem v27.5 |

### v27.4 — Rodada 13: base e pivô — 05/10/2026

Duas decisões do Humberto (`02 AS DECISOES`, seção 1, regra 5, e o quadro, linha "Pivô"), mais duas que o Diretor tirou delas. Quatro lotes, uma versão.

| O que ele vê | |
|:---|:---|
| **Mudar o pivô não mexe no desenho** | Definir pivô, Colar pivô, o painel Pivôs e Repetir para a pasta: nenhum desenho anda, na base nem em chave nenhuma. Antes ele pulava até o pivô novo cair na origem do osso (*"1 desenho recolocado, de (20; 0) para (24; −12)"*). Agora o rodapé diz *"1 desenho ficou parado"* |
| A imagem com chave própria (8d) | o osso escondido dela vai para o pivô novo, e cada chave de posição dele ganha o deslocamento daquele instante. Exato na base e em cada chave. Entre duas chaves com giro ela passa a girar em volta do pivô novo — é o sentido do pivô —, e o rodapé avisa: *"Entre as chaves de "gira", a imagem passa a girar em volta do pivô novo"*. Medido: 4,44 px no pior instante de um giro de 60° com escala |
| A imagem sem chave própria | o desenho fica, e o pivô fica **à mão**: o osso não está nele. O Salvar, o Exportar skin e o Carimbar o respeitam (antes, o próximo Salvar o devolvia ao osso, calado). No painel Pivôs, uma **bolinha laranja** na miniatura e *"· pivô à mão"* na prévia |
| **Imagens → Voltar o pivô para o osso** | o pivô à mão volta para onde o osso está, sem mover nada. Na imagem escolhida, ou em todas as marcadas. Ctrl+Z devolve. O rodapé do Carimbar diz quantas pulou |
| **O osso próprio nasce no pivô** | girar uma imagem numa animação a faz girar em volta do pivô dela, como no Spriter, e não do centro. Vale para o osso próprio NOVO; os que já existem não andam |
| Exceção, escrita | **a imagem solta (no osso raiz) e sem pivô à mão nasce no centro, como antes**: ali o "pivô do osso" seria o canto (0, 0) da cena, e ela giraria em volta dele |
| **Peça tirada da base: as chaves ficam guardadas** | apagar um osso ou uma imagem tira as chaves dela das animações e as **guarda no arquivo**. O rodapé diz *"Apagar: 9 chaves de 3 peças guardadas em 2 animações. Crie de novo com o mesmo nome e elas voltam"* |
| A peça volta | criar (ou renomear) uma peça com o **mesmo nome e do mesmo tipo** religa as chaves dela, chave por chave, com a ordem de desenho: *"5 chaves guardadas voltaram de "braco", em 2 animações"*. Um Ctrl+Z tira a peça e as chaves juntas. De outro tipo (era osso, voltou imagem), não religa, e diz. Se a peça nova já tem chave naquela linha, a guardada continua guardada, e diz — *"um não apaga o outro"* |
| **Base → Chaves guardadas…** | a lista por peça (quantas chaves, em quantas animações) e **Jogar fora todas**. Ctrl+Z devolve. Sem nada guardado, cinza dizendo por quê |

Por dentro: nenhum campo novo no núcleo. As chaves guardadas e os pivôs à mão moram em `extensions.RECORTE_editor_state` (`chavesGuardadas`, `pivosAMao`), que nenhum leitor vê; a timeline com alvo inexistente seria L1 (spec 4.7). Arquivo sem as listas: o carimbo sai byte a byte como antes (os 5 exemplos com atlas). Contas novas em `editor/src/io/pivot-still.ts` e `editor/src/doc/guarded-keys.ts`.

Testes reescritos de propósito (provavam o contrário da decisão): `pivo` — *"numa região usada por 2 desenhos…"* e *"…os 2 desenhos são recolocados"*; `arquivo` — os dois do P67; `ferramentas` — *"girar a mão… gira em volta dela mesma"*.

### v27.3 — Rodada 4, lote 8: os contextos — a área de trabalho por tarefa — 05/10/2026

O Humberto, 04/10: *"Lá tem uma aba só de janelas. E contextos."* O Diretor decidiu pelo Photoshop: o contexto é a **área de trabalho** dele, trocada por um botão no canto de cima.

| O que ele vê | |
|:---|:---|
| Um **botão no canto de cima à direita**, depois do nome do arquivo | a dica diz *"Área de trabalho: Padrão. Clique para trocar…"*; em 1440×900 o nome aparece ao lado do ícone; em 1280×720 só o ícone |
| Clicar | a lista: **Montar · Animar · Pesos · Pivô · Visualização** · os arranjos guardados · *Guardar este arranjo…* · *Voltar ao padrão do contexto*. O em uso tem ✓ |
| **Montar** | esquerda Árvore, Ordem · Propriedades; direita Imagens, Entidades, Pivôs, Partículas · Skins, Regras; linha do tempo fechada |
| **Animar** | esquerda Árvore · Propriedades; direita Animações, Imagens, Entidades · Histórico, Exibição; **linha do tempo aberta** |
| **Pesos** | esquerda Árvore · Propriedades; direita Malha e pesos (75% da altura) · Exibição, Histórico; linha do tempo fechada |
| **Janela → Arranjos** | os três contextos em cima, Pivô e Visualização logo abaixo, como antes |
| Reabrir o programa | o botão lembra o contexto escolhido (`RECORTE_contexto`, no navegador) |

O que um contexto não cita fica **fechado no lado de fábrica dele**: o menu Janela o reabre em casa.

**Duas escolhas, escritas:** (1) na primeira abertura, e depois de *Voltar ao padrão*, o botão diz **"Padrão"**, e não "Montar": a tela de fábrica não é a do Montar, e o botão mentiria (regra 21). (2) **Em 1280×720 falta lugar na barra de cima.** A primeira ligação quebrou o menu "Malha e regras" em duas linhas (foto); agora os menus não quebram, e quem cede é o **nome do arquivo**, que encolhe com reticências (78 → 55 px) e guarda o nome inteiro na dica.

Três ações novas (283 na tabela) e três linhas na folha de tarefas. **Um teste de outro arquivo reescrito de propósito**, pelo nome: `menus.test.ts` › *"o menu Janela mostra o submenu Arranjos, com os dois de fábrica e as duas portas"* — os três contextos entraram em cima. Fotos em `backup/fotos-obra/rodada-04/lote-8/`.

| Números | |
|:---|:---|
| Suíte | 4.993 (+4): 4.963 passam, 29 pulados, 1 vermelho, o antigo do manual · 06h59 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 · 06h59 a 07h01 |

### v27.2 — Rodada 4, lote 6: Shift+Tab esconde só as colunas — 05/10/2026

O Photoshop tem dois: `Tab` esconde tudo; `Shift+Tab` esconde os painéis e deixa as ferramentas. O nosso tinha só o `Tab`.

| Tecla | O que ele vê |
|:---|:---|
| **`Shift+Tab`** | somem as duas colunas e os painéis soltos; **a linha do tempo fica**; a cena vai a 1.440 px (em 1440×900). De novo, tudo volta |
| `Tab` | igual a antes: some tudo, a linha do tempo junto. **E agora os painéis soltos também** (antes ficavam por cima da cena vazia) |
| Qualquer uma das duas, com algo escondido | mostra tudo de volta |

Porta no menu: **Janela → Arrumar → Esconder só as colunas** (`Shift+Tab` escrito ao lado). O `Shift+Tab` não se grava: abrir o programa com as colunas sumidas por uma tecla de ontem seria um susto. A decisão é do `ui/hide-panels.ts`. Ação nova `esconder-colunas` (280 na tabela), com linha na folha de tarefas. Um teste meu (`paineis-do-photoshop.test.ts`, lote 2) passou a ler a linha nova da alça. Fotos em `backup/fotos-obra/rodada-04/lote-6/`.

| Números | |
|:---|:---|
| Suíte | 4.989 (+2): 4.959 passam, 29 pulados, 1 vermelho, o antigo do manual · 06h50 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 · 06h50 a 06h51 |

### v27.1 — Rodada 4, lote 5: puxar o vão da tira solta o grupo inteiro — 05/10/2026

O Photoshop: puxar a barra do grupo leva o grupo inteiro. No nosso, a barra do grupo é o **vão da tira** (o espaço à direita das abas).

| O que ele vê | |
|:---|:---|
| Puxar o vão da tira para a cena | a sombra do painel segue a mão; o rodapé diz *"Solte para deixar o grupo Árvore, Ordem solto aqui"*; largar solta o **grupo inteiro**, com as abas dele na barra |
| Clicar numa aba da barra do grupo solto | ela vem à frente |
| Puxar a barra do grupo solto até uma tira | a linha azul; largar cola **todas** as abas ali, na ordem, também na outra coluna |
| Largar o vão sobre outra tira | o grupo inteiro entra nela |
| `×` do grupo solto | fecha todas as abas dele; o menu Janela traz cada uma |
| Menu Janela numa aba que está atrás, num grupo solto | o grupo volta para a coluna, e o item age como sempre |
| Voltar ao padrão | o grupo volta inteiro |

**O dado guardado:** o solto ganha a lista `tabs`. O arranjo antigo (sem a lista) abre como antes; um programa de antes deste lote, abrindo um arranjo novo, ignora a lista e as outras abas voltam ao grupo de fábrica — nada se perde (provado, simulando o leitor de antes).

**Um defeito da ligação, visto no uso e consertado antes do fecho:** segurando o grupo sobre a cena, a sombra só aparecia quando ele colava numa borda — ela era desenhada só para a aba. Agora aparece para os dois.

O `dockPanel` (`panel-groups.ts`) devolve o grupo inteiro; o `openPanels` conta todas as abas do grupo solto; o `parseColumnState` lê a lista. **Dois testes reescritos de propósito**, pelo nome, em `paineis-do-photoshop.test.ts`: *"'Voltar ao padrão' com um grupo solto: o dockAllFloating de hoje PERDERIA abas…"* (provava o defeito; agora prova que devolve todas) e *"o programa de ANTES deste lote abrindo um arranjo novo…"* (o leitor de hoje passou a ler a lista; o "de antes" agora é simulado tirando o campo). Fotos em `backup/fotos-obra/rodada-04/lote-5/`.

| Números | |
|:---|:---|
| Suíte | 4.987 (+3): 4.957 passam, 29 pulados, 1 vermelho, o antigo do manual · 06h44 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 · 06h44 a 06h45 |

### v27.0 — Rodada 4, lote 4: dois cliques recolhem — 05/10/2026

É o Photoshop: dois cliques na aba recolhem o painel até a tira; de novo, abrem.

| O que ele vê | |
|:---|:---|
| **Dois cliques na aba** | o grupo dela recolhe (o mesmo que o `▾`): em 1440×900 a Árvore vai de 339 para 37 px, e o espaço vai para o outro; dois cliques de novo, ela volta. O último grupo aberto não recolhe, e o rodapé diz o caminho |
| **Dois cliques na barra do painel solto** | ele encolhe até a barra (35 px); de novo, volta ao tamanho de antes. Colado na borda de baixo, a barra fica no chão |
| Reabrir o programa | o solto recolhido continua recolhido |

**Um defeito da ligação, visto no uso e consertado antes do fecho:** o segundo par de dois cliques não reabria — o primeiro clique reabria o grupo (o gesto de 13/09, "clicar num nome recolhido abre") e o `dblclick` logo depois o fechava. Agora, se o clique acabou de reabrir, o par para ali.

O leitor da coluna (`parseColumnState`) passa a guardar a marca `recolhido` do solto (só `true` recolhe). **Um teste reescrito de propósito**, pelo nome: em `paineis-do-photoshop.test.ts`, *"a marca guardada: só true recolhe; o programa de antes ignora a marca…"* virou *"…e o leitor da coluna a guarda ao reabrir (lote 4 ligado)"* — ele provava que o leitor de antes jogava a marca fora; agora prova que guarda. Fotos em `backup/fotos-obra/rodada-04/lote-4/`.

| Números | |
|:---|:---|
| Suíte | 4.984 (+2): 4.954 passam, 29 pulados, 1 vermelho, o antigo do manual · 06h35 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 · 06h35 a 06h37 |

### v26.9 — Rodada 4, lote 9: o Propriedades nunca fica menor que a ficha rápida — 05/10/2026

Passado pela rodada 23: o defeito #4 do `07 A NOITE CONFERIDA`, e os antigos K17 e J17 da fila. Com os Detalhes da linha do tempo abertos, o Propriedades ficava tão baixo que o **Ângulo** da ficha rápida ficava fora, até em 1920×1080.

| Tela, Detalhes abertos, osso `forearm` | Propriedades antes → agora | Ângulo à vista | A Árvore fica com |
|:---|:---:|:---:|:---:|
| 1920×1080 | 168 → **265** px | não → **sim** | 260 px |
| 1440×900 | 134 → **265** px | não → **sim** | 153 px |
| 1280×720 | 102 → **239** px | não → **sim** (a ficha de osso inteira, até o Alfa) | **80 px: só a tira e a barra dela, nenhuma linha** |

**O custo, escrito:** em 1280×720 não cabe tudo, e quem cede é a Árvore — fica com 80 px, a tira e a barra de botões, e **nenhuma linha à vista** (ela rola). Com os Detalhes abertos se anima: o osso se escolhe na cena ou na linha do tempo. O `▾` recolhe a Árvore de vez. A cena e a linha do tempo não cederam nada. A ficha de uma **imagem** é 38 px mais alta que a de osso: lá, ela rola, e o rodapé diz quanto falta — **só quando falta de verdade** (a primeira ligação dizia "faltam 26 px" com a ficha de osso inteira à vista; visto na foto e consertado antes do fecho: o aviso fala da ficha medida, não da de fábrica).

Por dentro: a decisão é do `planColumn` (`ui/props-floor.ts`); a casca põe um `min-height` no grupo do Propriedades e, cedendo, 80 px no outro. Refeito a cada mudança de altura da coluna (a linha do tempo abre, a janela muda). A alça arrastada à mão não desce abaixo do chão. Com a linha do tempo fechada o chão vale também: em 1280×720 o Propriedades foi de 136 para 265 px. Fotos em `backup/fotos-obra/rodada-04/lote-9/`.

| Números | |
|:---|:---|
| Suíte | 4.982 (+4): 4.952 passam, 29 pulados, 1 vermelho, o antigo do manual · 06h29 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 · 06h29 a 06h30 |

### v26.8 — Rodada 4, lote 3: o painel solto não sai da tela — 05/10/2026

| O que ele vê | |
|:---|:---|
| A janela encolhe (1440×900 → 1280×720) com um painel solto no meio-baixo | antes: o painel ficava onde estava, **123 px por cima dos botões da linha do tempo** (foto `antes_1`). Agora volta para dentro da faixa do meio, inteiro (foto `depois_1`). Quando a janela cresce de novo, ele volta ao lugar e ao tamanho que tinha |
| Um solto guardado por uma versão de antes (que deixava pendurar) | abre inteiro dentro |
| Puxar o canto de mudar o tamanho | a caixa cresce até a borda e para, sem pular de lugar. **Provado só pelo teste**: com o mouse por protocolo o canto parou em 349 px nas duas versões, e a foto `*_2` não prova nada |

Por dentro: a casca não usa mais o `clampFloat` (que só guardava 48 px de barra à vista); usa o `fitFloat` e o `resizeInside` (`ui/float-fit.ts`). O `clampFloat` continua em `panel-groups.ts`, para o `setFloatBox`, que já recebe a caixa inteira. Fotos em `backup/fotos-obra/rodada-04/lote-3/`.

| Números | |
|:---|:---|
| Suíte | 4.978 (+4): 4.948 passam, 29 pulados, 1 vermelho, o antigo do manual · 06h19 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 · 06h19 a 06h20 |

### v26.7 — Rodada 4, lote 2: a coluna recolhe em ícones — 05/10/2026

O Humberto: *"Era para poder recolher eles, e expandir. Era para seguir a filosofia do Photoshop."* Antes, o `▾` só encolhia o grupo na altura; a coluna continuava com 260 px na parede.

| O que ele vê | |
|:---|:---|
| A **setinha dupla** (`«` `»`) numa faixa fina no topo de cada coluna, do lado da parede | um clique recolhe a coluna numa **faixa de ícones de 40 px**; a cena cresce (1440×900: de 904 para 1.132 px com uma coluna, 1.360 com as duas) |
| Clicar num ícone | o painel abre **ao lado da faixa**, por cima da cena, na altura do ícone; clicar de novo, ou `Esc`, fecha; clicar noutro troca |
| A mesma setinha | expande |
| **Janela → Arrumar → Recolher em ícone · Expandir** | as duas colunas de uma vez; cinza dizendo por quê quando não há o que fazer |
| Reabrir o programa | as colunas voltam como estavam (`RECORTE_colunas_em_icones`, no navegador, nunca no `.bone`). **Voltar ao padrão** expande |

Cada ícone tem o nome do painel na dica. Por dentro: `ui/icon-columns.ts` decide; a casca desenha. Duas ações novas (279 na tabela) e duas linhas na folha de tarefas. Fotos em `backup/fotos-obra/rodada-04/lote-2/`.

**O que custou, medido:** a faixa da setinha tira **cerca de 10 px de altura** de cada painel. Nenhum painel deixou de caber (30/30 e 21/30, como antes), mas o que já rolava rola 10 px a mais: Propriedades 314 → 324 px, Malha e pesos 591 → 601, e a Prévia em 1280×720 fica com 101 px (eram 111) para um palco de 160. A setinha não foi para a tira de abas porque na tela de fábrica a tira da direita já tem três linhas: ali ela custaria uma linha (33 px), e pularia de lugar conforme as abas.

| Números | |
|:---|:---|
| Suíte | 4.974 (+4, a ligação deste lote): 4.944 passam, 29 pulados, 1 vermelho, o antigo do manual · 06h13 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 · 06h13 a 06h14 |

### v26.6 — Rodada 4, lote 1: puxar o painel e ver ele vir junto — 05/10/2026

**Esta versão leva também a seção seguinte, "Leitor do Construct — K1 a K7 (sem a K5)"**, do chat do Construct, que estava sem número: o texto dela é o dele, e entra aqui.

O Humberto: *"atualmente eles [os painéis] ficam presos nas paredes"*. O soltar existia, mas pelo arrasto do navegador: fora das tiras o cursor dizia "proibido", e nada seguia a mão. Conferido no uso em `documentos/projeto do programa/09 OS PAINEIS - conferidos e o plano 2026-10-05.md`.

| O que ele vê | |
|:---|:---|
| Puxar a aba para a cena | a **sombra do painel inteiro** segue a mão; o rodapé diz *"Solte para deixar Ordem solto aqui"*; largar solta ali, inteiro dentro da tela |
| Puxar a aba (ou a barra do solto) até uma tira | a **linha azul** onde ela vai entrar; largar cola ali. O painel solto cola de volta **pelo mesmo gesto** |
| Largar sobre o **corpo** de outro grupo | o **contorno azul** do grupo; cola no fim dele (antes, a aba flutuava ali e caía meio fora da tela) |
| `Esc` com a mão segurando | nada muda; o solto volta para onde estava |
| Clicar na aba | continua só escolhendo |
| **Janela → Arrumar → Soltar o painel da parede** | solta o painel em uso no alto da cena |

Por dentro: `ui/panel-drag.ts` decide (clique × arrasto, linha, contorno, sombra) e `ui/float-fit.ts` põe a caixa inteira dentro; a casca só mede e desenha. O arrasto do navegador saiu das abas e das tiras — um só jeito de arrastar. Ação nova `soltar-painel` (277 na tabela; e uma linha em `ferramentas/provas/tarefas.ts`, *"Soltar o painel da parede, para ele flutuar sobre a cena"*). Dois testes que liam o texto do `shell.ts` foram reescritos de propósito, pelo nome: *"a caixa tem barra com nome, × que fecha e canto que muda o tamanho"* e *"a casca desenha a sombra antes de soltar, e cola ao soltar"* (citavam `soltouNaTira`, `floatPanelAt` e o `drag`). Fotos em `backup/fotos-obra/rodada-04/lote-1/`.

| Números | |
|:---|:---|
| Suíte | 4.970, igual à v26.5 arquivo por arquivo: 4.940 passam, 29 pulados, 1 vermelho, o antigo do manual (`exportar-e-ajuda.test.ts` › *carries every chapter, with the README first*) · 06h02 |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 (os mesmos de antes) · 06h03 a 06h04 |
| `programa/` | montado às 06h04: leva este lote e as duas palavras da v26.5, que não tinham sido montadas |

### Leitor do Construct — K1 a K7 (sem a K5) — entra na próxima versão fechada

Pasta nova `leitor-construct/`. O `.bone` no Construct 3 (LTS r449), por um addon SDK v2 com o nosso `runtime/` inteiro dentro. Só o desenho é novo. `runtime/`, `editor/` e `formato/` não mudaram. Instalar e ver é a mão do Humberto: `leitor-construct/LEIA-ME.md`.

| Rodada | O que existe |
|:---:|:---|
| K1 | `npm run leitor:construct`: o `runtime/` num `.js` só (ES2021, sem o `render/canvas.ts`), e o addon `saida/Recorte.c3addon` (mínimo r449). **90 de 90 sobre o pacote**: `npm run leitor:construct:conformidade` |
| K2 | O objeto **Recorte**: carrega o `.bone`, o atlas e a imagem da pasta Files; desenha com `drawMesh`; ação **Tocar animação**. As listas batem com o desenhador do editor, peça a peça |
| K3 | A máscara corta na conta (o Construct não tem máscara), provada contra o editor ponto a ponto. A sequência troca de quadro igual ao editor |
| K4 | **Vestir skin**, **Tirar skin**, **Está vestindo a skin**; a skin que esconde imagem, que traz osso, e a de outro arquivo |
| K6 | As partículas, todas as de um emissor num `drawMesh`; os 19 casos P batem com o editor; acima de 300 vivas, avisa |
| K7 | O boneco **parado no editor de layout**; propriedade **Skins iniciais**; velocidade, pausar, continuar, espelhar; **Ao terminar a animação** e **Ao evento** (as chaves do `.bone`); a partícula com folha de quadros |

O que ele não entende, ele avisa: na expressão **Avisos** e no console, com `[Recorte]`. Suposições sobre o r449 (o site pede verificação de robô) na tabela do LEIA-ME, com os links. O id `Recorte_Leitor` mora em `leitor-construct/id.mjs`, e espera a palavra do Humberto (`Bone_Leitor`?). Testes: 129, em `leitor-construct/testes/`, dentro da suíte.

### v26.5 — Rodada 23, fim: as duas palavras do runtime — 05/10/2026

Exceção dada pelo `DIRETOR · ed2cab` só para estes dois textos de aviso, que o lote 7 tinha deixado por estarem em `runtime/`.

| O que muda | |
|:---|:---|
| `runtime/src/externos.ts` | *"EXTERNAL_DUPLICATE: a **skin** … já existe aqui; vale a daqui (2.8)"* (era "a pele"). O código do aviso não muda |
| `runtime/src/file.ts` | *"Não deu para ler a **base** …"* (era "o corpo") |
| Quem conferia o texto | nenhum caso de conformidade, nem o runtime Python. **Um teste do runtime** conferia a palavra: `runtime/testes/externos.test.ts` > *pele de fora com osso* (`pele "default"` → `skin "default"`). **1 teste reescrito de propósito** |
| O leitor do Construct | `npm run leitor:construct` na mesma volta (o pacote leva o runtime dentro), autorizado pelo Diretor |

| Números | |
|:---|:---|
| Conformidade | 90/90 · `conformidade:dois`: 90 de 90 concordam campo a campo |
| Suíte | 4.970: 4.940 passam, 29 pulados, 1 vermelho, o antigo do manual. Deles: 129 do `leitor-construct`, 72 de `paineis-do-photoshop` (rodada 4), 4.769 do resto (4.743 de antes + 26 desta rodada) |
| tsc · roteiro · medir | limpo · 14/14 · 30/30 e 21/30 · 05h51 a 05h54 |
| `programa/` | **não montado**: às 05h54 a rodada 4 começou a mudar `editor/src/ui/shell.ts` (o arrasto de painel), e montar levaria o trabalho dela pela metade, sem medida. O `programa/` fica o de 05h48 (v26.4, sem estas duas palavras). **O zip desta versão leva o `shell.ts` como estava às 05h55, no meio da obra da rodada 4** |


### v26.4 — Rodada 23, lote 8: os pequenos, e o Salvar que calava — 05/10/2026

Fotos em `backup/fotos-obra/rodada-23/`, roteiros em `roteiros/`. Cada antes foi tirado com os arquivos de antes no lugar por um minuto e devolvidos (conferidos com `cmp`).

| # do `07` | O defeito, pela forma | Antes → depois |
|:---:|:---|:---|
| **8** | Salvar, Salvar como e Exportar skin **calavam**. *A forma: o cancelar e o "navegador não deixou" viravam o mesmo `null` calado* (o `catch` vazio). **Descoberto qual era:** os dois — no Chrome sem janela o `Ctrl+S` dá `AbortError` (como quem fecha a janela), e o Exportar pelo menu dá `SecurityError` | `E11_antes_salvar`, `T2_antes_exportar-skin`: rodapé igual. Depois: *"Salvar: a janela foi fechada sem escolher onde. Nada foi gravado"* · *"Exportar a skin: o navegador não deixou abrir a janela de escolher onde gravar: ele só a abre logo depois de um clique ou de uma tecla. Tente pelo menu de novo. Nada foi gravado"* (`io/picker-problem.ts`). Vale também para Entregar a base |
| **9** | O 🚫 na Árvore depois de Devolver o osso. *A forma: a Árvore lia a lista de ossos tirados que a cena só põe em dia quando desenha, e a Árvore se desenha antes* | `S5_antes`: `shin_b` e `foot_b` com 🚫. `S5_depois`: 👁. A Árvore põe a lista em dia antes de desenhar as linhas |
| **11** | A chave do quadro 0 meio escondida sob a coluna dos nomes. *A forma: a folga do fim (14 px) não existia no começo* | `D2_antes`: a chave de 179 a 201 px, a coluna acaba em 190. `D2_depois`: de 191 a 213. A régua e as faixas ganham 12 px à esquerda, juntas (a agulha e o tempo se medem pela régua: continuam batendo) |
| **12** | A frase da faixa que não anda confundia. *A forma: dizia o limite e não o gesto* — o conferente quis encurtar e pegou o corpo da faixa, não a ponta | Agora: *"espada já começa o mais cedo que pode (…): arrastar leva a faixa inteira. Para encurtar ou esticar, puxe a ponta, a alça no fim da faixa"* |
| **13** | O Sobre dizia "Versão 0.1.0". *A forma: lia o `package.json`, e não a versão guardada* | O Vite escreve a última de `backup/versoes` (a mesma conta do `montar-programa.py`). "Entidades → Caminho ▸" continua sem existir: é rodada própria, não conserto |

| | |
|:---|:---|
| Testes | 6 novos (`arquivo` 2, `linha-do-tempo` 2, `arvore` 1, `ajuda` 1). Nenhum reescrito |
| Suíte | 4.970: 4.940 passam, 29 pulados, 1 vermelho, o antigo do manual |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 · 05h45 a 05h47 |
| `programa/` | **montado depois desta versão** (o zip da v26.4 leva o `programa/` de antes; o montado é o código desta versão, e o Sobre diz v26.4) |


### v26.3 — Rodada 23, lote 7: as palavras — skin, base, boneco, e o nome que a linha do tempo diz — 05/10/2026

Defeitos 2 e 10 do `07 A NOITE CONFERIDA`. Fotos em `backup/fotos-obra/rodada-23/`: `S1_depois_01` (*"Skin "skin" criada…"*), `D9_depois_05` (a mão), `P3_depois_02` (o emissor: Propriedades diz *"Emissor: torso_particulas"*; a seta dá *"2 chaves em 0,50 s: Emissor torso_particulas: Posição X, …"*). O antes está nas fotos da rodada 21 (`S1_01`, `S6_00`, `D9_05`, `D5_01`, `P3_02`). Roteiro `roteiros/d2.mjs`.

**A forma (regra 27):** *o nome de dentro chegava à tela.* O id (`pele`, `hand_osso`), o tipo do formato (`skeleton`, "Anexo") e a palavra velha (esqueleto) saíam direto para o que o usuário lê.

| O que muda | |
|:---|:---|
| A skin nova | nasce **"skin"**, "skin2"… (era "pele") |
| "esqueleto" na tela, frase por frase | Propriedades: o grupo e o título viram **Base** · Novo: *"Começa um boneco novo, vazio"* · a cena: *"Área de desenho do boneco"* · a Árvore: *"…parâmetros do boneco"* · aba Skins: *"A base é a mesma, só o desenho muda"* · aba Regras (2): *"…faz o boneco se mexer…"* · importar PSD: *"Já existe uma base neste arquivo"* · abrir: *"Qual boneco abrir?"* · a linha do tempo, o grupo das chaves de entidade: **Entidade** |
| O rodapé da chave no osso próprio | diz o nome da linha do tempo: *"Imagem hand: Posição Y"*, *"Entidade espada: …"*, *"Emissor …: …"* (era *"Posição Y de hand_osso"*). A linha do tempo também diz Entidade e Emissor, e não "Imagem", para esses dois (`ownBoneLabel`) |
| O emissor | Propriedades diz **"Emissor:"**; mover e girar dizem *"Mover emissor"*, *"Girar emissor"* |
| O exportador glTF | *"Não achei uma das skins pedidas"* (era "peles") |
| **Ficou, e por quê** | *"a pele … já existe aqui"* e *"Não deu para ler o corpo"* moram no `runtime/` (`externos.ts`, `file.ts`), que esta rodada não toca. Vão ao Diretor |
| Testes | 4 novos (`peles` 2, `linha-do-tempo` 1, `paineis` 1). **Reescritos de propósito: 11** — 10 em `peles` (contavam com o nome "pele" da skin nova: as 22 linhas trocam `'pele'` por `'skin'`) e 1 em `paineis` (o título `'Esqueleto'` vira `'Base'`) |

| Números | |
|:---|:---|
| Suíte | 4.964: 4.934 passam, 29 pulados, 1 vermelho, o antigo do manual |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 |
| Hora | 05h33 a 05h36 |
| `programa/` | não montado ainda (05h40) |

**Fim de linha:** nesta rodada, edições por Python em modo texto e por `sed` trocaram o fim de linha (LF ↔ CRLF) de 16 arquivos do editor, do `CHANGELOG` e do `QUEM E QUEM`. Achado e devolvido, arquivo por arquivo, ao estilo de antes (conferido byte a byte com a cópia de 04h51). *A forma: escrevi com uma ferramenta que reescreve o fim de linha sem dizer.*

### v26.2 — Rodada 23, lote 6: a tecla P com o emissor — uma ordem só, e nada calado — 05/10/2026

Defeito 7 do `07 A NOITE CONFERIDA`, **refeito com o teclado de verdade** (o P desce por `Input.dispatchKeyEvent`, fica embaixo durante o clique, e sobe depois). Fotos em `backup/fotos-obra/rodada-23/`: `P5_antes_01` (v26.1, com `parent-gesture.ts` e `tools/select.ts` de antes no lugar por um minuto e devolvidos, conferidos com `cmp`: Fogo no torso, emissor escolhido, P embaixo, clique no `head`: o rodapé diz só *"Arquivo não salvo."* e o emissor continua no `torso`), `P5_antes_02` (a ordem do programa: `head` escolhido, P embaixo, clique no emissor: *"head ficou com 1 filho novo"*, o emissor vai para o `head`); `P5_depois_01` e `_02`. Roteiro `roteiros/d7.mjs`.

**O que repetiu e o que não:** o P **funciona**, na ordem que o programa ensina em todo lugar (o rodapé, o menu Base → Virar filho de…, a Árvore, o Próximo passo): **o osso primeiro**, depois P segurado e o clique no filho. A ordem contrária vinha da ficha da rodada 21, um documento, e não do programa. O que repetiu foi o silêncio: na ordem trocada (a do Spine: o filho primeiro) o clique no osso virava um clique comum, e ninguém dizia nada.

**A forma (regra 27):** *o gesto na ordem trocada caía num clique comum, calado.*

| O que muda | |
|:---|:---|
| P com o emissor (ou uma imagem) escolhido | o rodapé diz o nome dele e a ordem inteira: *"Para prender torso_particulas: o osso vem primeiro. Escolha o osso, depois segure P e clique em torso_particulas"* |
| O clique num osso com o P ainda embaixo | o osso fica escolhido, e o rodapé diz o passo que falta: *"head escolhido. Agora segure P de novo e clique em torso_particulas: ele vira filho de head"*. Vale para qualquer ferramenta e para a Árvore (ouve a seleção, não o clique). P em cima cala |
| A ordem | uma só, a do programa. Não passou a aceitar as duas |
| Testes | 2 novos em `arvore` (158 → 160). Nenhum reescrito |

| Números | |
|:---|:---|
| Suíte | 4.960: 4.929 passam, 29 pulados, **2 vermelhos, nenhum desta rodada**: o antigo do manual, e `leitor-construct/testes/exemplo.test.ts` > *cada ação do Heroi existe no aces.json* (o teste foi gravado às 05h25 e o `aces.json` às 05h19: o outro chat no meio do lote; não mexi) |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 |
| Hora | 05h24 a 05h26, com outros chats gravando (regra 24). Memória livre: 0,77 GB no começo da suíte |
| `programa/` | não montado (05h40) |

### v26.1 — Rodada 23, lotes 4 e 5: Pôr entidade na cena entra de pé, onde se vê (e o Ângulo, que não repetiu) — 05/10/2026

**Lote 5 — defeito 5 do `07`.** Fotos em `backup/fotos-obra/rodada-23/`: `M4_antes_01` (v26.0, com o `entities-actions.ts` de antes posto no lugar por um minuto e devolvido, conferido com `cmp`: sem osso escolhido, a espada vai para a **raiz** em (0, 0), o chão do herói) e `M4_antes_02` (no antebraço, girada −76,8° no mundo); `M4_depois_01` (no meio da vista, presa ao osso mais perto, o `torso`, de pé: 0° no mundo) e `_02` (no antebraço, de pé). Roteiro `roteiros/d5.mjs`.

**A forma (regra 27):** *a porta do menu não fazia a conta do gesto.* O arrasto já punha de pé e no osso mais perto (rodada 8b, A2); o menu, que devia chamar a mesma conta, não chamava. **"Não pergunta qual": não repetiu como defeito.** O menu já pergunta quando há mais de uma entidade; o herói de exemplo só conhece a espada, e então ela vai direto.

| O que muda | |
|:---|:---|
| Entidades → Pôr entidade na cena | com osso escolhido: preso a ele, com o giro que o deixa de pé no mundo. Sem osso: no meio do que a cena mostra, no osso mais perto, pela mesma conta do arrasto (`entityMenuPlace`) |
| Testes | 2 novos em `acoes` (44 → 46). Nenhum reescrito |

**Lote 4 — defeito 4 do `07` (o Ângulo fora do painel): não repetiu como descrito; sem conserto.** Fotos `T1_antes_*` e `T1_antes_detalhes_*` (1280×720, 1440×900, 1920×1080), roteiro `roteiros/d4.mjs`. **O painel rola**: a roda do mouse em cima de Propriedades leva o `scrollTop` de 0 a 120 nos três tamanhos, e o Ângulo aparece. O que repete é a **altura**: com os Detalhes da linha do tempo abertos, o corpo de Propriedades fica com 29 px (1280×720), 61 px (1440×900) e 95 px (1920×1080), e só X e Y se veem; o Ângulo começa na borda (em 1920×1080, 631 a 660, com o painel acabando em 636: é o que o conferente viu). Isso é tamanho de painel, que a ficha da rodada deixa para a rodada 4. Nenhum campo foi escondido.

| Números | |
|:---|:---|
| Suíte | 4.926: 4.896 passam, 29 pulados, 1 vermelho, o antigo do manual |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 |
| Hora | 05h17 a 05h19, com outros chats gravando (regra 24) |
| `programa/` | não montado (05h40) |

### v26.0 — Rodada 23, lote 3: o que deixa de existir sai da seleção, na hora — 05/10/2026

Defeito 3 do `07 A NOITE CONFERIDA`. Fotos em `backup/fotos-obra/rodada-23/`: `S3_antes_01` (v25.9: Nova skin, osso novo nela, × na skin: o osso some da Árvore e **continua escolhido**), `S3_antes_02` (Novo osso, `Ctrl+Z`: `osso2` continua escolhido sem existir, e Propriedades mostra a ficha de um osso que não há); `S3_depois_01` e `_02` (nos dois, a seleção fica vazia e Propriedades volta à ficha da base; o rodapé continua dizendo *"Desfeito: Novo osso"*). Roteiro `roteiros/d3.mjs`.

**A forma (regra 27):** *a seleção guardava o nome de quem já não existe.* Cada caminho que faz sumir alguma coisa teria de lembrar de limpar a seleção, e nenhum lembrava. Por isso a conta mora num lugar só.

| O que muda | |
|:---|:---|
| O documento | depois de cada comando de estrutura (fazer, desfazer, refazer), tira da seleção o osso, slot, anexo e regra que não existem mais (`doc/prune-selection.ts`). "Existir" é o que a Árvore mostra: no arquivo, e não tirado pela pilha de skins. Só conta quando o documento é o próprio corpo (com a virada de corpo, a seleção é do outro arquivo) |
| Tirar a skin da pilha | não é comando: o `setSkinStack` faz a mesma conta |
| Os vizinhos do 07 | desfazer a criação de um osso escolhido · apagar osso só na skin e devolvê-lo (são comandos: passam pela mesma conta) |
| O rodapé | o aviso de seleção sai **antes** do aviso do comando, para a frase do comando ficar |
| Testes | 4 novos em `peles` (178 → 182). Nenhum reescrito |

| Números | |
|:---|:---|
| Suíte | 4.890: 4.859 passam, 29 pulados, **2 vermelhos, nenhum desta rodada**: o antigo do manual (`exportar-e-ajuda`) e `leitor-construct/testes/pacote.test.ts` > *o pacote no disco é o do código de agora* (o `src/` do leitor mudou às 05h10 e o pacote não foi remontado: o outro chat estava no meio do lote; não mexi). Entram 63 de `paineis-do-photoshop` (rodada 4, outro chat), verdes |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 |
| Hora | 05h10 a 05h13, **com outros dois chats gravando** (regra 24) |
| `programa/` | não montado (05h40) |

### v25.9 — Rodada 23, lote 2: a espada solta nasce tocando, e acompanha o que se mexe por dentro — 05/10/2026

Defeito 6 do `07 A NOITE CONFERIDA`. Fotos em `backup/fotos-obra/rodada-23/`: `E6_antes_01` (v25.8: a espada solta no antebraço, o anexo sem `animation`, o filho toca **nada**, `lamina` 0) e `_02`; `E6_depois_01` (a solta toca `idle`, o rodapé diz *"Ela toca idle"*) e `_02` (de volta ao herói depois de girar a `lamina` por dentro: a da mão 2,4°, a solta 36,6° no relógio dela, que começa em 0,50 s, onde ela entra). Roteiro `roteiros/d6.mjs`.

**A forma (regra 27):** *a cópia nova nascia sem animação.* Não era o "acompanhar": o arquivo da espada mexida chegava às duas. Era que a solta não tocava nada (pose de montar), e a `idle` mexida só aparece em quem toca a `idle`. Procurada a mesma forma: o menu **Pôr entidade na cena** passa pelo mesmo comando e tinha o mesmo buraco; consertado junto.

| O que muda | |
|:---|:---|
| A entidade solta (arrasto e menu) | nasce tocando a **primeira animação** dela, como a espada do herói de exemplo e como a armadura filha do DragonBones. Sem animação conhecida (o filho não aberto), nada é gravado e o rodapé diz que ela fica parada e onde se escolhe |
| A faixa | já existia com os Detalhes abertos (as duas linhas, `weapon` e `espada`); fechados, mostra a escolhida, que é a solta logo depois de soltar (C11, de propósito). Agora a faixa da solta diz *"espada: idle"* em vez de vazia |
| Testes | 5 novos em `cena` (103 → 108). O do herói inteiro solta **duas** cópias, uma com e uma sem animação, e vê a sem animação ficar parada: o teste se vê falhar. Nenhum reescrito |

| Números | |
|:---|:---|
| Suíte | 4.812: 4.782 passam, 29 pulados, 1 vermelho, o antigo do manual. `leitor-construct` subiu de 48 para 61 (outro chat) |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 |
| Hora | 05h03 a 05h05 |
| `programa/` | não montado (05h40) |

### v25.8 — Rodada 23, lote 1: o Delete com uma chave escolhida apaga a CHAVE, e não o osso — 05/10/2026

Defeito 1 do `07 A NOITE CONFERIDA`. Fotos em `backup/fotos-obra/rodada-23/`: `D1_antes_01` e `_02` (v25.7: Detalhes abertos, `forearm` escolhido pela Árvore, `K`, clique no losango, `Delete`: o foco está no `BODY` e **o osso some**, 18 → 17 ossos), `D1_depois_01` a `_03` (o foco vai para a linha do tempo no clique; o `Delete` tira só a chave de rotação e o osso fica; sem chave, com o foco fora, o `Delete` apaga o osso como antes). Roteiro `roteiros/d1.mjs`.

**A forma (regra 27):** *o clique que escolhe na folha não levava o teclado junto.* O losango para o evento no `pointerdown` (para não selecionar texto no arrasto), e com isso o foco ficava na Árvore ou na cena; o `Delete` caía na casca, que apaga o escolhido na cena. Não repetiu pelo caminho mais curto: o botão **Detalhes** leva o foco à folha, e quem o aperta logo antes não vê o defeito.

| O que muda | |
|:---|:---|
| A linha do tempo | pega o foco em qualquer clique dentro dela (na captura, antes de quem para o evento), menos num campo de texto. A tecla age onde está o foco, como no Spriter e no Spine; a cena já fazia assim |
| `Delete` com o foco na folha | com chave escolhida, apaga a chave. Sem nenhuma, **não engole a tecla**: segue para a casca e apaga o escolhido na cena (`deleteKeyGoesTo`) |
| A mesma forma, procurada | `Ctrl+C`, `Ctrl+V`, `Ctrl+X` e as setas já eram da folha: consertadas pelo mesmo foco. **`Ctrl+D` não era**: com chave escolhida duplicaria o osso. Agora a folha diz como se duplica chave (copiar e colar) e não mexe no osso; sem chave, segue para a casca |
| Testes | 3 novos em `linha-do-tempo` (119 → 122). Nenhum reescrito |

| Números | |
|:---|:---|
| Suíte | 4.794: 4.764 passam, 29 pulados, 1 vermelho, o antigo do manual (`exportar-e-ajuda` > *the manual page carries every chapter*). Entram 48 do `leitor-construct/` (rodada K1, outro chat) |
| tsc · conformidade · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 |
| Hora | 04h54 a 04h57 |
| `programa/` | **não montado** nesta versão: outro chat confere o montado até 05h40. A montagem vem depois, com os lotes que estiverem fechados |

### v25.7 — Rodada 8c, lote 8: a faixa da entidade à vista sem abrir os Detalhes — 05/10/2026

C11 do `04 O QUE JA FAZ`. Fotos em `backup/fotos-obra/rodada-08c/`: `29_antes_fechada_a` (v25.6: a linha do tempo fechada é tocador, régua e Resumo, 121 px, e a faixa da espada não aparece), `30_depois_fechada_a` (a mesma `walk`: aparece a linha **weapon · espada: idle**, e a faixa fechada mede 156 px), `_b` (a ponta se puxa com os Detalhes fechados). Roteiro `fechada.mjs`. A foto `29` foi tirada com `dock-model.ts`, `shell.ts` e `dopesheet.ts` de antes postos no lugar por um minuto e devolvidos (conferido com `cmp`).

| O que muda | |
|:---|:---|
| A linha do tempo fechada | quando a animação aberta tem entidade, ganha **uma** linha a mais: a faixa da entidade escolhida na cena, ou da primeira. Ela se puxa, se arrasta e tem o botão direito, como aberta. Com mais de uma entidade, a dica do nome diz quantas há e como ver as outras |
| A altura | 121 px sem entidade (como era), 156 com (121 + 35, a altura de uma linha de faixa). Uma linha só, qualquer que seja o número de entidades. Na base (sem animação aberta) a linha sai |
| **Desvio, dito aqui** | a régua do lote 14 dizia que a fechada tem altura **constante**, para a cena não mudar de tamanho de um arquivo para outro. Agora a cena fica 35 px menor quando a animação aberta tem entidade (medido: 627 → 592 px em 1440×900). É o preço de a faixa estar à vista; a régua continua valendo para o número de linhas de osso |

Testes novos: 2, em `linha-do-tempo.test.ts`.

### v25.6 — Rodada 8c, lote 7: laço ou tamanho, o grude no fim, o aviso da emenda, esticar junto — 05/10/2026

C15 do `04 O QUE JA FAZ`. Fotos em `backup/fotos-obra/rodada-08c/`: o "antes" é a foto `03_depois_faixa_a` (v25.5: a faixa vai até o fim, sem laço nem tamanho, e *"Nenhum aviso"*); `20_depois_laco_a` (a espada toca brilho, 0,6 s, na walk, 1,0 s, em laço: a borda do fim fica vermelha e a barra diz **1 aviso**), `_b` (a ponta solta perto do fim **gruda**: ×0,6, uma volta de 1,00 s, e o aviso some), `_c` (o botão direito na faixa tem **Em laço**), `_d` (sem laço: a faixa tem tamanho, e o resto fica listrado). Roteiro `laco.mjs` (o último passo grava a velocidade por código, e o rodapé da foto `_d` diz "teste" por isso).

| O que muda | |
|:---|:---|
| **Em laço / sem laço** | o `loop` do anexo da entidade (7.11). Em laço ela roda sozinha, a partir de onde entra, sem fim; sem laço, toca **uma volta** e para no último quadro — a faixa passa a ter tamanho, e o resto fica listrado. Porta: **Entidades → Em laço** (marcado quando está em laço) e o botão direito na faixa |
| **O grude no fim** | soltar a ponta perto de um ponto em que um número inteiro de voltas fecha no fim da animação a leva para lá (perto = 2 quadros ou 3% da faixa) |
| **O aviso da emenda** (regra 21) | a entidade em laço, à vista do começo ao fim de uma animação em laço, que não cabe um número inteiro de vezes nela, ganha aviso na barra e na faixa (borda vermelha), com os números: *"espada dura 0,7 s e andar dura 1 s: ela dá um salto na emenda. Puxe a ponta até o fim"* |
| **Esticar junto** | *Animação → Mudar duração…* com **Esticar as chaves**: a velocidade das entidades em que se escolheu a animação acompanha, no mesmo passo. A que segue o anexo ou o pai não estica (ninguém escolheu nada nela) |

**Testes reescritos de propósito, pelo nome:** `acoes.test.ts` › *"toda ação dos doze menus está nela…"* (275 → 276) e *"registerCoreActions registra toda ação de arranque…"* (114 → 115); `existir-nao-e-funcionar.test.ts` › a lista das que nascem cinzas (41 → 42), com estado e efeito exigido para `entidade-em-laco`. Linha nova em `ferramentas/provas/tarefas.ts`; as folhas `O QUE O PROGRAMA FAZ` e `O QUE NAO TEM PORTA` de 05/10 foram geradas de novo. Testes novos: 7 em `linha-do-tempo.test.ts`, 1 em `existir-nao-e-funcionar.test.ts`.

### v25.5 — Rodada 8c, lote 6: puxar a ponta e arrastar a faixa da entidade — 05/10/2026

C13 e C14 do `04 O QUE JA FAZ`. Fotos em `backup/fotos-obra/rodada-08c/`: `02_antes_faixa_*` (v25.4: a faixa da espada não tem ponta, e arrastá-la não muda nada), `03_depois_faixa_*` (a ponta puxada para fora: *"espada toca idle a 0,9119× a velocidade: uma volta dura 1,10 s"*; a faixa arrastada: *"espada entra em 0,33 s"*; o Ctrl+Z desfaz só o arrasto). Roteiro `faixa.mjs`. As fotos `02` foram tiradas com `panels/dopesheet.ts` e `.css` de antes postos no lugar por um minuto e devolvidos (conferido com `cmp`).

| O que muda | |
|:---|:---|
| **A ponta** (C13) | uma alça verde no fim da **primeira volta** da animação da entidade (a duração dela ÷ a velocidade). Puxar para fora: mais devagar; para dentro: mais rápido. Grava `nested/timeScale` no começo da faixa, **em degrau** (sem rampa); quando a linha não existia, o que valia antes vai numa chave em 0, no mesmo passo. A faixa escreve a velocidade (*"espada: idle ×0,9119"*). Entre 0,05× e 20× |
| As voltas seguintes | em laço, um traço fino onde cada volta começa |
| Volta maior que a faixa | a alça encosta por dentro do fim, com a seta **›** (a volta continua depois) |
| **Arrastar a faixa** (C14) | muda quando ela começa: andam juntas a chave que a faz entrar, a que a tira (se houver) e as chaves `nested` dela. O começo novo cai num quadro. Não passa da chave de antes, nem sai da animação; no limite, o rodapé diz, e não fica passo de desfazer vazio. A entidade que vinha da base ganha as duas chaves (vazio em 0, ela no tempo novo) |
| Desfazer | cada gesto é **um** passo de Ctrl+Z |
| Formato | nenhum campo novo: `nested/timeScale` e a chave `slot/attachment` (spec 7.11, 9.9) |

Testes novos: 8, em `linha-do-tempo.test.ts`.

### v25.4 — Rodada 8c, lote 5: o salto da espada — a miniatura punha a espada viva em repouso — 05/10/2026

Achado da rodada 8d: a espada **salta ~1,8** na primeira chave criada em qualquer peça, e não volta com Ctrl+Z. Fotos em `backup/fotos-obra/rodada-08c/`: `00_antes_salto_a/b` (v25.3: idle em 0,5 s, chave na perna de trás; o centro da lâmina vai de (40,41; 26,51) para (38,65; 26,01)), `01_depois_salto_a/b` (fica em (40,41; 26,51), antes e depois do Ctrl+Z). Roteiro `salto.mjs`.

| | |
|:---|:---|
| A causa | **não era o relógio, nem o runtime.** A miniatura do slot na Árvore e na Ordem (`panels/thumbnails.ts`) pegava o esqueleto **vivo** da espada e o punha na pose de repouso para tirar a foto. Toda chave nova muda a estrutura e refaz as miniaturas: a lâmina ficava em repouso (giro 0 em vez de 3) até a pose seguinte. O Ctrl+Z também muda a estrutura, e fazia o mesmo |
| Como se achou | o relógio da espada (idle, 0,5 s), os ossos do herói e a mistura eram iguais antes e depois; uma pose nova à mão consertava. Num rascunho fora do navegador (sem miniatura) não saltava |
| O conserto | a miniatura desenha um esqueleto **novo**, dos mesmos dados — como a miniatura da aba Entidades (`entity-thumb.ts`) já fazia |
| A forma, para procurar em casa (regra 27) | *pôr em repouso o esqueleto vivo para fazer uma conta ao lado*. Procurei os outros `setToSetupPose` do editor: todos usam esqueleto novo. Era só este |
| Prova | o teste novo, em `ordem.test.ts`, **caiu na v25.3** (*esperava 3, veio 0*) antes do conserto |

### v25.3 — Rodada 8b, lote 4: a entidade com entidade dentro entra inteira, e ganha cartão — 05/10/2026

C18 do `04 O QUE JA FAZ`. Fotos em `backup/fotos-obra/rodada-08b/`: `20_antes_C18_*` (v25.2: *Arquivo → Trazer para o projeto → Abrir uma entidade…* com o `heroi.bone` sozinho dá dois avisos — *"as imagens ficaram de fora"* e *"O esqueleto aninhado espada.bone não foi aberto; esse slot fica vazio"* —, o cartão sai sem desenho, e pendurado ele não desenha nada, com 1 aviso), `21_depois_C18_*` (o cartão com miniatura; pendurado, o herói-2 aparece inteiro, com a espada na mão dele). Roteiro `c18.mjs` (a janela de arquivo do Windows é trocada por uma que entrega o `heroi.bone`).

| O que muda | |
|:---|:---|
| A entidade de dentro | quando ela não foi escolhida na janela, mas o projeto **já abriu** aquele arquivo (a espada do herói), ela entra junto. Quando o projeto não a conhece, o aviso de antes continua |
| As imagens | o `.bone` que veio sozinho, para dentro de um projeto, procura as imagens nos atlas que o projeto já tem abertos, e o aviso diz isso. Sem atlas no projeto, o aviso de antes continua |
| O cartão | *Abrir uma entidade* passa a avisar os painéis: o cartão aparece na hora (antes, só no desenho seguinte da aba) |
| Pendurar e trocar pela grade | a base em foco passa a conhecer o esqueleto da entidade trazida de fora antes de pendurar (`garantirAninhado`). Sem isso o slot nascia vazio, com aviso |

Testes novos: 5, em `documento.test.ts`.

### v25.2 — Rodada 8b, lote 3: clicar numa animação da entidade anima a entidade por dentro, com a cena montada — 05/10/2026

C10 do `04 O QUE JA FAZ`. Fotos em `backup/fotos-obra/rodada-08b/`: `10` (antes do clique), `11` (depois de clicar em **attack** da espada: a Árvore mostra os ossos da espada, a linha do tempo é a dela, e o herói continua à vista), `12` (um gesto na lâmina, com o herói em volta), `13` (clicar em **walk** do herói volta). Roteiro `c10.mjs`. O "antes" desta linha é o da v25.1: o clique dizia no rodapé que ainda não abria (CHANGELOG da v25.1).

| O que muda | |
|:---|:---|
| Clicar numa animação da espada, na lista | **a espada passa a ser a base em foco**, na animação clicada. A Árvore, a Ordem, as Propriedades e a linha do tempo são dela. Ela entra em Bases (*Base — montar · espada*) |
| A cena continua montada | o herói aparece **parado, por baixo**, na pose em que estava; só o slot da espada não é desenhado nele, porque a espada em foco está ali. Os ossos, as alças e o clique são só da espada |
| A espada fica na mão | a raiz dela é posada com a matriz do slot do herói, a mesma conta do runtime (spec 7.11, `parentMatrix`). Medido: a raiz fica em (27, 72, −77°) dentro do herói e aberta por dentro |
| A lista, de dentro da espada | as animações da espada em cima, e embaixo **heroi · base**, com as animações dele |
| Voltar | clicar numa animação do herói (ou no nome de uma base em Bases): o foco volta ao herói, e a espada volta a ser entidade, dirigida pela faixa. **O herói passa a desenhar a espada com o que se mexeu nela** |
| Mexida e não salva | a espada **fica em Bases** e o título diz *não salvo*; o rodapé diz por quê. Sem mexida, ela volta a Entidades |
| Sem o arquivo da espada | o editor agora guarda o texto do `.bone` de cada entidade ao abrir (`doc/entity-files.ts`). Quando não tem, o clique diz o que dá para fazer, e não troca nada |
| Desfazer | um passo por gesto, como em qualquer base: a pilha é a do projeto |

**O que ficou de fora, dito aqui para não parecer feito:** a espada é desenhada **por cima** do herói inteiro, e não na posição dela na ordem de desenho · o herói fica parado (a agulha da espada não move o herói) · Salvar o que se mexeu na espada passa pelo Salvar do projeto (ela está em Bases); **não conferi** se o Salvar grava `espada.bone` com o exemplo aberto pelo menu Ajuda, que não tem pasta. **Achado antigo, sem mexer:** o `heroi.bone` de exemplo grava `"selection": ["hips"]` (uma lista), e quem abre a espalha na seleção como `{"0": "hips", …}`.

Testes novos: 11, em `animando.test.ts`; um teste do lote 2 foi reescrito de propósito (ele lia o texto da assinatura da lista, que passou a contar o herói).

### v25.1 — Rodada 8b, lote 2: a entidade aparece na lista de Animações, como uma base, com as animações dela — 05/10/2026

C9 do `04 O QUE JA FAZ`. Fotos em `backup/fotos-obra/rodada-08b/`: `03` (antes, v25.0: a lista só tem idle, walk e attack do herói), `04` (depois: **espada · entidade · 3**, e embaixo idle, brilho, attack), `04_…_clique-no-nome` (o clique no nome escolhe os slots dela; rodapé *"Entidade espada, encaixada nos slots weapon, espada"*). Roteiro `c9.mjs`; para a lista caber na foto, ele recolhe o grupo Imagens pelo botão da tira. A foto `03` foi tirada com o `panels/animations.ts` de antes posto no lugar por um minuto e devolvido (conferido com `cmp`).

| O que muda | |
|:---|:---|
| A aba Animações | embaixo das animações da base em foco, **uma linha por entidade encaixada**: o nome, a palavra *entidade*, quantas animações; e as animações dela embaixo, recuadas, com a duração e o *repete* |
| Na mesma lista que rola | não é uma caixa nova: a aba já é baixa, e uma segunda lista roubaria altura |
| A mesma espada em dois slots | uma linha só (é o mesmo arquivo); a dica diz os slots |
| Arquivo da entidade não aberto | a linha diz *não aberta*, e a dica diz por quê, em vez de uma lista vazia (regra 21) |
| Clique no nome | escolhe na cena os slots em que ela está |
| Clique numa animação dela | **ainda não anima por dentro** (é o C10, próximo lote): o rodapé diz isso, e aponta a faixa |
| `data-rolagem="lista"` | passou a marcar também a `ul` da lista, que é quem rola de verdade. Sem isso a medição contava 20 de 30 em vez de 21: a lista com a espada passou a rolar em 1280×720, que é o certo para uma lista |

Testes novos: 7, em `animando.test.ts`.

### v25.0 — Rodada 8b, lote 1: a entidade cai onde foi solta, presa ao osso mais perto — 05/10/2026

A2 do `04 O QUE JA FAZ`. Fotos em `backup/fotos-obra/rodada-08b/`: `00` (antes, v24.9: soltei a espada no antebraço e ela foi para o osso `root`), `01` (depois: a Árvore mostra `forearm › espada`), `02` (na animação `attack` a espada sobe com o braço). Roteiros `a2.mjs`, `a2-anda.mjs`.

| O que muda | |
|:---|:---|
| Arrastar uma entidade da aba Entidades para a cena | ela fica **no osso mais perto do ponto** (o corpo do osso, da origem à ponta), e não mais no `root`. O rodapé diz qual: *"espada" virou uma tomada no osso forearm* |
| O lugar | a raiz da entidade fica **no ponto onde ela foi solta**, e de pé: o anexo ganha o giro que desfaz o giro do osso. Em osso sem giro, o arquivo não ganha `rotation` |
| O osso próprio de uma imagem (rodada 8d) | fica de fora da busca: é da imagem |
| A imagem | **não muda**: continua nascendo na raiz, livre (lote 60) |
| *Entidades → Pôr entidade* | não muda: vai para o osso escolhido, ou a raiz |

Nos manuais: o Spriter 1.4 não fala de sub-entidade. O DragonBones Pro (seção *Skeleton — basicConcept*) diz que o projeto tem vários esqueletos e o esqueleto filho aparece no painel Repositório. O osso mais perto é a decisão da ficha. Testes novos: 5, em `cena.test.ts`.

### v24.9 — Rodada 6, lote 3: as palavras — "pele" vira "skin" e "corpo" vira "base", em todo texto que o usuário lê — 05/10/2026

Decisões 1 e 3 do Humberto (04/10). Fotos `30` (a aba **Skins**), `31` (a janela Animação), `32` (*Arquivo → Exportar*: *Uma imagem por skin…*, *Entregar uma base…*, *Skin, para outro boneco…*) em `backup/fotos-obra/rodada-06/`; roteiro `palavras.mjs`.

| O que muda | Quanto |
|:---|:---|
| Textos entre aspas em `editor/src` | **297**, em 44 arquivos: a aba Skins, o menu Janela, os avisos, os rodapés, as dicas, as janelas de pergunta, a contagem do exportar por skin |
| **Não** mudam | ids de ação (`nova-pele`, `colar-corpo`), ids de painel (`peles`), classes CSS (`peles-lista`, `painel-corpo`), nomes de arquivo e de variável, campos do formato (`skins`, `body`), e o nome velho citado de propósito nas dicas (*"Era Esqueleto → Novo → Pele"*) |
| A concordância | *o corpo* → *a base*, *um corpo novo* → *uma base nova*, *Este corpo não tem* → *Esta base não tem*, e os pronomes à mão (*"Clique nela"*, *"rebaixar esta"*, *"dali em diante a cena mostra ela"*) |
| *"o corpo inteiro entra nela"* (pendurar entidade) | virou *"a entidade inteira entra nela"*: ali "corpo" era a entidade, não a base |
| *"corpo do osso"* (8d: o clique no corpo do osso) | **fica**: é o osso, não a base |

**A forma de um erro meu, achado pelo `tsc` antes de gravar o lote:** *a troca por texto entrou dentro de `${…}`*, onde mora nome de variável. Duas viraram nome que não existe (o `tsc` acusou); **uma virou nome que existe** — `${corpo}` → `${base}` em `ui/where-model.ts`, onde `base` é outra variável —, e essa compilaria calada, mostrando a coisa errada no rodapé. Comparei toda interpolação com a cópia de antes e devolvi as 20 que mudaram; as duas que tinham texto de verdade dentro foram acertadas à mão. **A mesma forma nos testes:** a troca mexeu em linhas que conferem o CÓDIGO-fonte (`expect(fonte).toContain(…)`), e não a tela; voltaram as 10 linhas.

**Testes reescritos de propósito, por arquivo** (54; nenhum apagado, nenhum pulado): `peles.test.ts` 26 · `animando.test.ts` 4 · `acabamento.test.ts` 3 · `arquivo.test.ts` 3 · `chaves.test.ts` 3 · `documento.test.ts` 2 · `eventos-e-malha-ligada.test.ts` 2 · `exportar-por-pele.test.ts` 2 · `pasta-do-projeto.test.ts` 2 · `previa.test.ts` 2 · `acoes.test.ts` 1 · `exportar-e-importar.test.ts` 1 · `grade-de-imagens.test.ts` 1 · `linha-do-tempo.test.ts` 1 · `pivo.test.ts` 1. O nome da skin de teste (`"pele"`, nos dados) continua `"pele"`: é dado, não texto.

A folha `documentos/O QUE O PROGRAMA FAZ 2026-10-05.md` foi gerada de novo (o menu Janela diz Skins).

Números, 01h25 a 01h27: suíte **4.696** (4.666 verdes, 29 pulados, 1 vermelho antigo do manual) · `tsc` limpo · conformidade 90/90 · roteiro 14/14, nenhum passo mudou · medição 30/30 e 21/30 · contagem em `backup/contagem-testes_2026-10-05_01-26_v24.9.tsv`.

### v24.8 — Rodada 6, lote 2: as portas — 32 funções que só existiam em botão de aba ou em gesto ganham item de menu — 05/10/2026

Fotos `20_*` (os doze, 1440×900), `22_*` (1280×720), `21_*` (os submenus Malha ▸, Pesos ▸, Troca de base ▸, Variáveis e etiquetas ▸), `23`–`25` (o uso: *Malha e regras → Malha → Virar malha* com o tronco escolhido, e *Skins → Editar esta skin…*), em `backup/fotos-obra/rodada-06/`; roteiros `submenus2.mjs`, `uso.mjs`.

| Menu | O que entrou | De onde vinha |
|:---|:---|:---|
| Imagens | Trazer como sequência · Copiar pivô · Colar pivô | botão direito na aba Imagens. Agem no desenho escolhido; a sequência pergunta a subpasta quando há mais de uma |
| Base | Salvar como base nova… | botão da janela Animação. A pergunta do nome é a mesma (`askNewBase`) |
| Malha e regras | **Malha ▸** (Virar malha, Gerar automática, Traçar contorno, Criar vértice, Apagar vértice, Usar a forma de outra malha) · **Pesos ▸** (Ligar ossos, Pesos automáticos, Suavizar tudo, Podar, Chavear pesos, Tirar pesos) · Trocar os ossos da regra… · Apagar regra · Chave do parâmetro aqui · Apagar parâmetro | a aba Malha e pesos (zero itens de menu antes) e as linhas da aba Regras. Cada uma traz a aba à frente e chama o mesmo botão (`panels/mesh-actions.ts`, no molde de `rules-actions.ts`) |
| Animação | Troca de base ▸ Tirar a troca daqui · Variáveis e etiquetas ▸ Renomear etiqueta, Apagar etiqueta | a troca só saía pelo Delete da folha; as etiquetas, pelo lápis e pela lixeira da aba Regras |
| Skins | Clonar skin (o Duplicar da aba; a rodada 1 conferiu, S10: mesmos ossos) · Fazer a skin de uma pasta… · Apagar skin · Editar esta skin… (o lápis) | botões da aba Peles |
| Entidades | Pôr entidade na cena… · Escolher a animação dela… · Promover a base · Rebaixar a entidade | arrastar da aba; botão direito na faixa; botão direito na aba Entidades; botão da janela Animação |
| Partículas | Prender ao osso escolhido | a rodada 15 fez o prender pela tecla P e pelo campo Osso (`runReparent`); o menu chama o mesmo. Sem osso escolhido, pergunta qual |

**Todo item novo, cinza, diz por quê** (régua 3), com a frase do momento: *"Escolha uma malha primeiro. Uma imagem vira malha em Malha e regras → Malha → Virar malha"*, *"Não há troca de base neste quadro…"*, *"Copie o pivô de uma imagem primeiro…"*.

**Quando a lista tem uma opção só, a porta age na hora**, sem janela: uma etiqueta, uma entidade, uma base para rebaixar.

**Desvio do `05`, pela régua da casa:** *"Escolher a animação da entidade…"* tem 31 letras, e o nome de item tem no máximo 28 (`MAX_CHARS`). Ficou **"Escolher a animação dela…"**, dentro do menu Entidades.

**Os (novo) que já existem e entraram:** Esconder e Ignorar esta imagem (lote 1), Tirar a entidade (lote 1), o painel Partículas (já estava no Janela), **Prender ao osso escolhido** (agora), **Clonar skin** (agora).

**Os vigias da casa pegaram tudo, e foi bom:** cada ação de arranque nova tem de ser exercitada sem painel, ou estar escrita numa lista com motivo. **14 ganharam estado e efeito** em `existir-nao-e-funcionar.test.ts`; **8 terminam numa janela** (`ESPERAM_JANELA`); **7 pedem imagem lida do disco ou um projeto de várias bases** e o teste prova só a metade que dá sem navegador: ficam cinzas e dizem por quê (`acoes.test.ts`, *"as portas da rodada 6 que pedem imagem ou projeto"*). O efeito destas sete é o do botão da aba; as fotos `23`–`25` mostram duas portas pelo mouse.

**Saíram do painel para o arquivo de ações, para o menu chamar a mesma conta:** `setEntityAnimationAt` (era `setEntityAnimation`, privado na folha), `promoteEntityRow` (era `promote`, privado na aba Entidades), `askNewBase` (a pergunta do Salvar como base nova). `deleteRule` e `deleteParameter` da aba Regras passaram a públicos e a ler o documento do arranque.

**As folhas geradas**, de novo, com a data do relógio: `documentos/O QUE O PROGRAMA FAZ 2026-10-05.md` e `O QUE NAO TEM PORTA 2026-10-05.md` (**sem porta: 14 → 9**). As de 22/09 foram para `backup/`. O `CLAUDE.md` ainda cita as de 22/09 nas linhas 7 e 8 da tabela "Leia nesta ordem": avisado ao Diretor.

**Testes reescritos de propósito:** `acoes.test.ts` 2 (a conta da tabela 241 → 275; a das de arranque 82 → 114) · `existir-nao-e-funcionar.test.ts` 1 (a lista das cinzas 20 → 41, pelo nome) · `linha-do-tempo.test.ts` 1 (K15 lê a conta em `dopesheet-actions.ts`, e confere que o painel a chama). **Novos: 15** (14 estados e efeitos, e o das sete cinzas). Nenhum apagado, nenhum pulado.

Números, 01h09 a 01h11: suíte **4.696** (4.666 verdes, 29 pulados, 1 vermelho antigo do manual) · `tsc` limpo · conformidade 90/90 · roteiro 14/14, nenhum passo mudou · medição 30/30 e 21/30 · contagem em `backup/contagem-testes_2026-10-05_01-09_v24.8.tsv`.

### v24.7 — Rodada 6, lote 1: a barra de doze menus, cada item no lugar do desenho aprovado — 05/10/2026

Desenho: `documentos/projeto do programa/05 O DESENHO DOS MENUS 2026-10-04.md`, aprovado pelo Humberto. Fotos `00_*` (antes, v24.6), `10_*` (1440×900) e `12_*` (1280×720) com os doze abertos, `11_*` com os submenus novos, em `backup/fotos-obra/rodada-06/`; roteiros `roteiros/menus.mjs`, `submenus.mjs`, `cinza.mjs`.

**A barra:** Arquivo · Editar · **Imagens** · **Base** (era Esqueleto) · **Malha e regras** · Animação · **Skins** · **Entidades** · **Partículas** · Exibir · Janela · Ajuda. A ordem do trabalho, como no Spriter.

| | Antes (v24.6) | Agora |
|:---|:---:|:---:|
| Menus | 7 | 12 |
| Maior menu à vista | Animação, 35 linhas | Animação, 21 |
| Menus que rolavam em 1440×900 | 6 de 7 | nenhum |
| Menus que rolam em 1280×720 | — | nenhum (o Animação acaba em 693 px de 720) |

| O que muda | Onde |
|:---|:---|
| Os 25 itens que trocaram de menu, como no `05`: a pasta e o pivô vão para Imagens; Abrir a base e Trazer uma base de fora para Base; Nova regra, Novo parâmetro e Física para Malha e regras; o submenu Peles ▸ vira o menu Skins; Trazer entidade de fora e Tirar a entidade para Entidades; o emissor e os quatro prontos para Partículas. **"Trazer para o projeto ▸" sai**: ficou vazio | `ui/menus.ts` |
| Os submenus novos: **Pose ▸** (Editar), **Ir para ▸**, **Troca de base ▸**, **Chaves ▸** (Animação), **O boneco ▸**, **A cena ▸** (Exibir), **Arrumar ▸** (Janela); **Voltar ao padrão** entra em Arranjos ▸. As teclas valem de dentro do submenu, como antes | `ui/menus.ts`, `ui/actions-table.ts` (7 cabeças de submenu) |
| Os nomes dos itens são os do `05` (*Entregar uma base…*, *Nova skin*, *Esconder esta imagem*, *Colar outra base aqui*). O id de toda ação e toda tecla ficam iguais | `ui/menus.ts` |
| **O nome do item não quebra mais em duas linhas**, a linha que separa os blocos aparece (ela existia sem estilo nenhum, com altura zero), e a entrelinha do item ficou a de uma linha só. Numa tela de até 800 px de altura o vão do item cai de 6 para 3 px. O texto não muda de tamanho | `ui/shell.css` |
| **O item cinza diz por quê, no caso de agora** (régua 3): a ação pode dizer o motivo do instante, e ele vence a dica fixa. *Tirar a entidade*, com a espada original do herói: *"Esta entidade não tem imagem de antes: ela entrou em weapon sem substituir imagem nenhuma"* (achado do Diretor na 8a) | `ui/actions.ts` (`why`), `ui/shell.ts`, `panels/image-picker-model.ts`, `panels/palette-actions.ts` |
| **A paleta de comandos diz o caminho inteiro**: *Início* aparece como *Animação → Ir para*, e o nome do submenu também acha | `ui/palette.ts` |
| Os textos que citavam um caminho que mudou (régua 6): **8** — o rodapé "Próximo:" (Base → Virar filho de…), a aba Animações (Arquivo → Importar → Animações, de outra base…), a lista vazia de imagens (Arquivo → Importar → PSD…), a dica da imagem escondida na Árvore (Skins → Ignorar esta imagem), as guias (Exibir → A cena → …, três), Fechar o grupo (Janela → Arrumar → …). A prova de fotos do manual passa a abrir o menu Base | `ui/next-step-model.ts`, `panels/animations-model.ts`, `panels/palette-model.ts`, `panels/tree-rows.ts`, `panels/view-panel.ts`, `viewport/viewport.ts`, `ui/shell.ts`, `ferramentas/provas/fotos-manual.mjs` |

**Testes reescritos de propósito, por arquivo** (nenhum apagado, nenhum pulado), 20 ao todo: `menus.test.ts` 6, e mais 2 só no nome ("sete" → "doze") · `acoes.test.ts` 3 · `arquivo.test.ts` 2 · `colunas-e-barra.test.ts` 3 · `peles.test.ts` 2 · `animando.test.ts` 1 · `exportar-por-pele.test.ts` 1 · `ordem.test.ts` 1 · `exportar-e-importar.test.ts` 1. **Dois que passavam pelo motivo errado** (regra 28): o de "Reempacotar atlas" e o do menu Janela liam os menus pelo **índice** (3 e 5); com a barra nova o índice 3 ainda dava verde, olhando outro menu. Agora leem pelo nome. **Novos: 3** — o porquê do cinza no registro, o porquê de *Tirar a entidade* caso a caso, o caminho na paleta.

**A conta:** a tabela de ações vai de 236 para 241 ids: +7 cabeças de submenu, −2 que saíram com o menu de que eram parte (`trazer-para-projeto`, `peles`). **Função nenhuma saiu.**

Números, 00h47 a 00h50: suíte **4.681** (4.651 verdes, 29 pulados, 1 vermelho antigo do manual) · `tsc` limpo · conformidade 90/90 · roteiro **14/14, nenhum passo mudou** (ele só abre o Arquivo, que não mudou de nome) · medição 30/30 e 21/30, igual à v24.6. Contagem por arquivo em `backup/contagem-testes_2026-10-05_00-48_v24.7.tsv`.

### v24.6 — Rodada 3, lote 3 (E6): o projeto pesado de outro programa diz quanto pesa, e pergunta antes de ler — 05/10/2026

Fotos `40` (antes: 5 imagens entram sem pergunta nenhuma) e `41`, `42` (depois) em `backup/fotos-obra/rodada-03/`, roteiros `roteiros/e6-medir.mjs` e `e6-depois.mjs`.

**A forma do defeito:** *o peso só aparecia depois de pago.* O projeto do Humberto (`exemplo/game`) tem 128 imagens e **9 MB no disco**; cada imagem do jogo tem 1664×1157, e aberta ocupa largura × altura × 4: **801 MB** todas, **728 MB** as que o `.scml` cita. O programa lia todas sem dizer nada, e cada uma fica guardada aberta (a cena e as miniaturas). **Não reproduzi a trava:** com o Chrome do Humberto aberto a máquina tinha entre 430 e 1.200 MB livres durante a rodada; 728 MB não cabem. Medi 5 imagens (0,2 s, a página responde) e fiz a conta pelos cabeçalhos.

| # | O que muda | Onde |
|:---:|:---|:---|
| E6 | **Antes de ler as imagens, o programa pesa**: os primeiros 24 bytes de cada PNG dão largura e altura, sem abrir imagem nenhuma | `io/import-weight.ts` (novo, puro) |
| E6 | **Acima de 100 MB abertos, pergunta, com o número:** *"Este projeto do Spriter tem 115 imagens: 7 MB no disco, e perto de 728 MB abertas na memória. A maior tem 1664×1157. A sua máquina tem perto de 8 GB de memória; o navegador não diz quanto dela está livre."* Três caminhos: **Abrir com as imagens** · **Abrir sem as imagens** (ossos e animações; a barra de avisos diz quais imagens faltam) · **Não abrir** (é também o que vale ao fechar a janela) | `ui/shell-drop.ts` (`gateHeavyForeign`) |
| E6 | O **arrasto** e o menu **De outro programa…** passam pela mesma pergunta | `ui/shell-drop.ts`, `ui/shell-file.ts`, `io/import-foreign.ts` (`importFromOtherProgram` aceita o portão) |

**A linha de 100 MB:** em 28/09, no Chrome sem placa de vídeo, 10 imagens do jogo (73 MB) entraram em ~10 s; 20 (147 MB) prenderam a página por mais de 2 minutos. **Um erro de conta meu, achado pelo teste:** eu tinha posto a linha em 150 MB, lendo o "154 MB" do relato como MB de 1.024 × 1.024 — eram MB decimais, e as 20 imagens que travaram passariam sem pergunta.

**O navegador não diz a memória LIVRE** (`navigator.deviceMemory` é a da máquina, arredondada), e a frase diz isso em vez de inventar um número (regra 21; a régua 6 da ficha pedia "livres").

**Ficou de fora:** abrir **com** as imagens continua pesando o mesmo (cada imagem fica aberta inteira, com a borda transparente). Guardar só a parte desenhada mudaria o atlas provisório (`io/folder-atlas.ts`) e é outra rodada.

Testes novos: +6 em `editor/testes/exportar-e-importar.test.ts`, com as imagens reais do `exemplo/game`. Suíte 4.678 (4.648 verdes, 29 pulados, 1 vermelho antigo do manual).

### v24.5 — Rodada 3, lote 2 (M17): a pele e a animação exportadas voltam ao importar — 05/10/2026

Fotos `20`, `21` (antes) e `30`–`32` (depois) em `backup/fotos-obra/rodada-03/`, roteiros `roteiros/m17-antes.mjs` e `m17-depois.mjs`. A importação nas fotos passa pelo caminho do seletor (`readOpenedFiles`) com o texto que a Exportar grava; só o seletor do sistema é trocado por um `File`.

**A forma do defeito:** *o que eu gravo, eu não consigo ler.* Duas metades:

| # | O que estava errado | O que muda | Onde |
|:---:|:---|:---|:---|
| M17 | **O gravador esquecia `bones`** (obrigatório, 2.2) quando a pele não tinha osso próprio. A Importar recusava: *"Importar pele parou: /bones: expected an array"* (foto `21`) | O arquivo da pele sai sempre com `bones`, o **osso raiz primeiro** — o que o leitor de `assets.skins` ignora calado (2.8), como no `rigs/lobisomem-rabo.bone` | `io/export-skin.ts` |
| M17 | **A Importar só citava o uri** em `assets.skins`, e o editor monta o corpo **sem ler arquivo de fora**: com o gravador consertado, o rodapé dizia *"agora na lista de Feitas"* e a pele **não estava lá** (medido às 23:58 de 04/10) | **Importar pele copia a pele para dentro do corpo**, como o *Import Data* do Spine: a pele, os ossos `skinRequired`, os slots e as regras dela. A conta é a do runtime (`composeExternals`, 2.8): o osso raiz cai calado, o nome que já existe aqui vale, `binding.bones` traduzido pelo nome. Um passo de desfazer, exato (`ImportSkinCopy`) | `io/export-skin.ts`, `panels/skins-actions.ts` |
| M17 | A **animação** tinha a mesma forma: citada em `assets.animations`, aparecia em "De fora" pelo nome e **não tocava** | **Importar animação copia**, pela mesma conta (`ImportAnimationCopy`), com o `rig.reference` aplicado | `io/export-animation.ts`, `panels/animations-actions.ts` |
| — | Importar uma pele (ou animação) cujo nome **já existe** aqui | Não entra por cima: *"armadura.bone: a pele "armadura" já existe neste corpo. Apague ou renomeie a daqui, e importe de novo. Nada mudou"* | idem |

**A ida e volta (régua 4 da ficha):** exportar → apagar → importar devolve o arquivo **letra por letra**, com uma diferença dita: a pele (ou a animação) volta **no fim da lista**. Vale para o que a pele esconde e apaga (rodada 12). Levar a roupa para **outro boneco** traz o osso, o slot e a imagem dela.

**Ficou como estava, de propósito:** a classe `ImportSkinFile` (citar por uri) continua existindo — é o "pele de fora" do formato, para o jogo. A biblioteca de animações (`openAnimationLibrary`) **continua citando**, e o editor continua sem ler o que é citado: **é a mesma forma, e não é desta rodada** (dito ao Diretor). Malha **com pesos** numa pele exportada: os índices de `binding.bones` saem com os do corpo, e o formato não diz como levar ossos do corpo por nome sem `skinRequired` — **pergunta de formato, levada ao Diretor**.

**Teste reescrito de propósito** (`animando.test.ts`): "a lista do que falta chega à pergunta ANTES de o arquivo entrar" esperava `assets.animations = ['andar.bone']`; agora espera a animação dentro do corpo. Testes novos: +6 em `editor/testes/peles.test.ts`, +2 em `editor/testes/animando.test.ts` (provados vermelhos com o código de antes: 6 e 2). Suíte 4.672 (4.642 verdes, 29 pulados, 1 vermelho antigo do manual).

### v24.4 — Rodada 3, lote 1 (J9): o número digitado na ficha gira o osso, e diz quando uma regra não deixa — 04/10/2026

Fotos `00`–`04` (antes) e `10`–`14` (depois) em `backup/fotos-obra/rodada-03/`, roteiros `roteiros/j9-antes.mjs`, `j9-antes-perna.mjs`, `j9-depois.mjs`. Medido com mouse e teclado de verdade (Chrome sem janela, por protocolo): Enter, Tab e clique fora.

**A forma do defeito:** *o comando escrevia só no arquivo e dizia `transform`; um `transform` só repõe a pose, lida dos dados já carregados — com o número velho.* O campo dizia 90, o arquivo dizia 90, a cena ficava em −85 (foto `04`).

| # | O que muda | Onde |
|:---:|:---|:---|
| J9 | **A ficha rápida grava na base com `structure`**: X, Y, Escala X, Escala Y, Ângulo e Alfa chegam à cena, com os desenhos junto (foto `11`: a perna vai a 0°). Com animação aberta continua criando chave, como antes | `panels/quick-model.ts` |
| J9 | O padrão de `setPropertyOrKey` na base passa de `transform` para `structure`: a mesma armadilha, para quem vier. Hoje nenhum caminho vivo caía nele (os outros passam o tipo, ou recusam na base) | `anim/pose-mode.ts` |
| J9 | **Quando uma regra desfaz o número, o rodapé diz qual**: no herói o `arm` é do `ik_arm` — *"arm não girou: a regra ik_arm manda nele. Desligue o olho dela na aba Regras. Ficou na base: Ctrl+Z desfaz"* (foto `14`). É o recado que a cena já dava ao gesto (F3, L10, L11), agora também para quem digita, na ficha rápida e na de baixo | `panels/quick-model.ts` (`heldByRuleAfterWrite`), `panels/properties.ts` |
| J9 | **Ctrl+A, C, V e X num campo de texto são do texto.** No campo Rotação da ficha de baixo, Ctrl+A escolhia **todos os ossos**: o painel virava "Vários itens", o campo sumia, e o número digitado depois se perdia (ou acendia os atalhos 9 e 0). Achado ao medir o "clique fora". Salvar, desfazer e abrir continuam do programa | `ui/keys.ts` (`textKeepsKey`), `ui/shell.ts` |

A ficha de baixo (`writeFieldValue`) **já aplicava**: o defeito era só da ficha rápida. Testes novos: +7 em `editor/testes/paineis.test.ts` (provados vermelhos com o código de antes: 2 caíam), +3 em `editor/testes/teclas.test.ts`. Suíte 4.664 (4.634 verdes, 29 pulados, 1 vermelho antigo do manual).

### v24.3 — Rodada 15, lote 4: o emissor se move, gira e se prende, como a imagem — 04/10/2026

Fotos `40`–`45` em `backup/fotos-obra/rodada-15/`, roteiro `roteiros/lote4.mjs`.

| # | O que muda | Onde |
|:---:|:---|:---|
| 3 | **Mover e Girar agem no emissor escolhido**, como na imagem. Na base gravam `x`, `y`, `rotation` no emissor (§9.10); numa animação criam chave **só dele**, pelo osso próprio da rodada 8d. A marca e as partículas andam juntas. **Escalar recusa**, e o rodapé diz: *"O emissor não tem escala: ele se move e gira. O tamanho das partículas é "Tamanho", em Propriedades"*; em grupo, o emissor anda e não cresce | `viewport/tools/attachment-edit.ts`, `scale.ts`, `drawing-group.ts`, `doc/own-bone.ts` |
| 3 | **A ficha do emissor ganha "Onde está"**: Osso, X, Y e Giro, com número digitado. Com o osso próprio, os três apontam para ele (`throughOwnBone`, da 8d). A ficha rápida mostra a escala apagada, com o motivo na dica. O Espaço diz o que segue o emissor e o que fica no mundo: *"do emissor — partículas e gravidade seguem o emissor"* · *"do mundo — soltas ao nascer; a gravidade fica no mundo"* | `panels/properties-model.ts`, `panels/quick-model.ts` |
| 4 | **Prender a um osso**: pelo gesto da imagem (escolhe o osso, segura P, clica no emissor), pela Árvore, e pelo campo **Osso** da ficha — os três pela mesma porta (`runReparent`), que deixa o emissor onde está na tela: `x`, `y` e `rotation` são refeitos no osso novo | `doc/world-math.ts` (`fixAttachment` conhece o emissor) |
| — | **O emissor novo nasce apontando para cima no mundo** (o `rotation` desfaz o giro do osso: no tronco do herói ele saía para a esquerda, foto 21) e, sem nada escolhido, **exatamente no meio da cena** (o `x`, `y` levam até lá) | `panels/particle-presets.ts` (`placementFor`) |

**Testes reescritos de propósito** (`paineis.test.ts`): os grupos da ficha do emissor (entrou "Onde está"), "o slot aparece só para LER" (virou o campo Osso), a ficha numa pele que não é a default (a ordem dos grupos).
Testes novos: +8 em `editor/testes/ferramentas.test.ts`. Suíte 4.654 (4.624 verdes, 29 pulados, 1 vermelho antigo do manual).

### v24.2 — Rodada 15, lote 3: o emissor tem `x`, `y` e `rotation` (formato e os dois runtimes) — 04/10/2026

**Muda o formato** (decisão do Humberto, 04/10: o emissor ganha posição e giro próprios, como a imagem). Plano ao Diretor antes do código; ele refez as contas à mão e deu o "pode".

| O quê | Onde |
|:---|:---|
| A extensão ganha a **§9.10**: `x`, `y` (px) e `rotation` (graus), opcionais, padrão 0, **não animáveis**. `M_emissor = M_osso × T(x, y) · R(rotation)` — a ordem da imagem, sem escala. **Uma regra só:** onde a extensão lê "a matriz do osso", lê `M_emissor`. Escritas por extenso as consequências: girar o emissor gira o jato **e a gravidade local**; o `shape: "bone"` sai de cima do osso quando o emissor anda; o `shape: "mesh"` fica sobre a malha | `formato/extensions/BONE_particles.md` |
| O schema aceita os três; texto no lugar de número é `EXT_SCHEMA` (L1). O validador compilado foi refeito | `BONE_particles.schema.json`, `site/validador/esquema-compilado.js` |
| Runtime TypeScript: `emitterMatrix` (com os três em zero devolve a própria matriz do osso, sem conta nenhuma) nos quatro lugares que usavam a do osso | `runtime/src/attachments/particle.ts`, `loader.ts`, `particles/emitter.ts` |
| Runtime Python, escrito pela §9.10: `quadro_do_emissor` no lugar do quadro do osso, em `t` e em `t_i` | `runtime-python/recorte/loader.py`, `particles.py` |
| **Três casos novos**, com o número calculado à mão antes do código: P-018 (`x`, `y` num osso girado), P-019 (`rotation`, gravidade local, osso de escala não uniforme: a ordem `M × R`), P-020 (`world`, o osso andando entre os nascimentos: a matriz de `t_i`). TypeScript e Python bateram de primeira; **nenhuma frase da spec precisou de conserto** | `conformidade/casos/P-018…P-020` |
| A marca da cena, o clique e o painel leem a matriz do emissor | `editor/src/viewport/particles-view.ts` |

**Provas**: os 16 casos P de antes e o `particulas.bone` em cinco instantes saem **byte a byte** iguais à linha de base gravada às 23h09 com o runtime de antes (`ferramentas/testes/dados/dump-particulas-v23.9.json`); escrever os três campos com zero não muda nada; tirados os três campos (o leitor de antes), os três casos novos **falham** (regra 26). Conformidade **90/90** (P: 19/19) nos dois runtimes; confronto 90 de 90 campo a campo.

**Testes reescritos de propósito**: `particulas.test.ts` — a lista dos casos ganhou os três, e o leiame deles diz 04/10/2026; `runtime-python/testes/test_particulas.py` — `QUANTOS` 17 → 20.
Testes novos: +30 em `ferramentas/testes/particulas.test.ts`, +3 em `medida-particulas.test.ts`, +3 em `conformidade.test.ts`. Suíte 4.646 (4.616 verdes, 29 pulados, 1 vermelho antigo do manual).

### v24.1 — Rodada 15, lote 2: as partículas com lugar próprio — 04/10/2026

Fotos `20`–`23` em `backup/fotos-obra/rodada-15/`, roteiro `roteiros/lote2.mjs`.

| # | O que muda | Onde |
|:---:|:---|:---|
| 5 | **O painel Partículas**: Novo ▾ (o vazio e os quatro modelos, o mesmo menu do botão da cena), Duplicar, Apagar, e a lista dos emissores — o nome, o osso e o aviso curto. Clicar na linha escolhe o emissor. No menu Janela (bloco animar) e no arranjo de fábrica, depois do Pivôs | `panels/particles-panel.ts`, `panels/particles-model.ts`, `panels/particles-panel.css`, `ui/layout-model.ts`, `ui/menus.ts` |
| 5 | **Duplicar dá semente nova** ao emissor copiado (§9.9 da extensão: "Duplicar um emissor DEVE dar semente nova"): a menor que ninguém usa. Pelo painel, a cópia fica escolhida | `doc/duplicate.ts` |
| 6 | **Sem nada escolhido, o emissor nasce no osso mais perto do meio da cena** — nunca na raiz, que não se vê nem se clica. Imagem escolhida: no osso dela. O rodapé diz *"(o mais perto do meio da cena)"* | `panels/particle-presets.ts` (`boneForNewEmitter`), `viewport/view-center.ts` |
| 7 | **O emissor vazio nasce com o ponto suave** e desenha um fio de pontos com os padrões da extensão. No arquivo, só `path` a mais | `panels/particle-presets.ts` (`EMPTY_PRESET`), `panels/tree-actions.ts` |
| 8 | **Os avisos do emissor vão para o botão de avisos** e para a janela de Problemas, com Ir para: sem imagem, forma desconhecida, taxa 0, emissão desligada, e *"7 partículas cortadas neste quadro: o emissor … desenha no máximo 3"*. O "sem imagem" não se repete quando o carregador já avisou | `viewport/particles-view.ts` (`emitterWarningLines`), `ui/shell.ts` |

**Testes reescritos de propósito**, pelo nome:

| Arquivo | Teste | Por quê |
|:---|:---|:---|
| `arvore.test.ts` | o CORPO da ação é exercitado | o vazio nasce com `path: 'fx/ponto-suave'` |
| `acoes.test.ts` | toda ação dos sete menus está nela | 235 → 236: `painel-particulas` no menu Janela |
| `colunas-e-barra.test.ts` | a aba que o programa ainda não tem é pulada | `particulas` é a quinta aba de fábrica que o lote 16 não conhecia |
| `exportar-e-importar.test.ts` | o painel Imagens entrou na bancada | idem |
| `ordem.test.ts` | ela nasce na coluna da direita | o grupo de cima ganhou `particulas` |
| `tema-e-ficha.test.ts` | o Histórico entrou na bancada | idem |

E uma linha em `ferramentas/provas/tarefas.ts` (`painel-particulas`).
Testes novos: +8 em `editor/testes/paineis.test.ts`. Suíte 4.610 (4.580 verdes, 29 pulados, 1 vermelho antigo do manual). Medição 30/30 de lado, 21/30 de altura: o painel novo cabe nas duas telas.

### v24.0 — Rodada 15, lote 1: o emissor se vê e se clica — 04/10/2026

Ficha: `documentos/projeto do programa/rodadas/RODADA 15 - particulas usar o emissor 2026-10-04.md`.
Fotos de antes (`00`–`04`) e de depois (`10`–`12`) em `backup/fotos-obra/rodada-15/`, roteiros em `roteiros/`.

| # | O que muda | Onde |
|:---:|:---|:---|
| 1 | **Todo emissor tem marca na cena**: uma estrela de quatro pontas na origem dele, com um traço para onde as partículas saem — sadio ou não, parado ou jorrando. Escolhido, fica na cor da escolha. Não passa por interruptor de Exibição: é o lugar que se clica. Desenhada depois das alças do osso, que a tapavam | `viewport/viewport-draw.ts` (`drawEmitterMarks`), `viewport/particles-view.ts` (`emitterPlace`) |
| 2 | **Clicar na marca, ou numa partícula viva, escolhe o emissor**, e Propriedades abre na ficha dele. A marca vem por cima de tudo, até do corpo do osso; a partícula, na vez do slot. A caixa de seleção pega o emissor pela origem. O clique escolhe **só** o emissor, sem o osso (o emissor é uma peça) | `viewport/picking.ts`, `viewport/particles-view.ts` (`emitterHit`), `doc/own-bone.ts` (`isEmitterSlot`) |
| — | O runtime passa a exportar `particleFrame` e `ParticleCache` pelo `index.ts`: o clique acha a partícula pela **mesma** conta que a desenha | `runtime/src/index.ts` |

Testes: +6 em `editor/testes/cena.test.ts`. Suíte 4.602 (4.572 verdes, 29 pulados, 1 vermelho antigo do manual, o mesmo da v23.9).

### v23.9 — Rodada 12: a skin que falta — esconder, ignorar, o osso some com a skin — 04/10/2026

Ficha: `documentos/projeto do programa/rodadas/RODADA 12 - a skin que falta 2026-10-04.md`.
Fotos de antes e de depois em `backup/fotos-obra/rodada-12/`, roteiros em `roteiros/`.

| # | O que muda | Onde |
|:---:|:---|:---|
| S4 | **Esconder nesta pele**: o desenho escolhido não é desenhado com a pele do lápis vestida; a base não muda. É o *Set Hidden* do Spriter (manual 1.4, pág. 22). No arquivo, `null` (§4.4): **campo novo nenhum** | grade do botão direito (com o lápis numa pele que não é a default), Esqueleto → Peles ▸, aba Peles |
| S3 | **Ignorar nesta pele**: a pele deixa de mexer no desenho, por imagem; volta o de baixo. É o *Set Ignored* | os mesmos três lugares |
| — | Aba Peles: a lista **"Nesta pele"**, embaixo das colunas — o que a pele do lápis troca, esconde e apaga, uma linha por desenho, com Esconder e Ignorar na linha. A coluna da esquerda do *Edit Character Map* | `panels/skins.ts` |
| S8 | **Tirar a pele, o osso dela some junto**, da cena e da Árvore, com os filhos — as caixas *Hide skin bones* do Spine (pág. 115). O rodapé de desligar a pele deixou de ser coberto por "Arquivo não salvo" | `doc/skin-bones.ts` (`bonesGone`), `viewport/viewport-draw.ts`, `panels/tree.ts` |
| S9 | **Apagar um osso da base com a pele no lápis apaga só nela**, com os filhos: o osso fica no arquivo, e na pele os desenhos pendurados nele viram `null`. O nome vai em `skin.extensions.RECORTE_editor_state.ossosApagados` (regra 6). O rodapé diz os nomes: *Saíram da pele "pele" 2 ossos (arm_b, forearm_b) e 3 imagens (…). Na base e nas outras peles continuam*. Osso que nasceu na pele e só ela liga apaga de verdade; o que o clone também liga sai só da lista desta. "Devolver o osso" na linha de "Nesta pele" | `panels/skins-delete.ts`, `panels/tree-actions.ts` |
| S11 | Provado: duas peles no mesmo desenho, a de cima vence (esconder em cima esconde; trocar em cima troca) | teste e fotos `82`, `83` |
| S12 | Provado: vestir e tirar pele na Visualização não muda o arquivo, que segue limpo letra por letra | fotos `80`, `81` |

O desenho que a pele esconde fica na Árvore em cinza, escrito *escondida*, e
escolhível: é por ali que se chega nele para Ignorar.

Testes novos: 30 em `peles` (*"rodada 12 — S4 e S3…"*, *"— S8…"*, *"— S9…"*, *"o exemplo do Humberto: a pele "aguia"…"*,
*"— S11…"*), 3 em `arvore` (*"rodada 12 — a Árvore com a pele no lápis"*), 2 em
`existir-nao-e-funcionar` (as duas ações novas, com estado). **Reescritos de
propósito, pelo nome:** `acoes` *"toda ação dos sete menus está nela"* (233 → 235)
e *"registerCoreActions registra toda ação de arranque"* (80 → 82);
`arvore` *"tree.ts: uma lista, a dobra…"* e *"a Árvore anda no tempo"* (leem o
texto do `tree.ts`, que passou a dar a pilha de peles à Árvore);
`existir-nao-e-funcionar` *"as que ficam CINZAS"* (18 → 20).

**Fecho**, 04/10/2026, das 22:35 às 22:38, casa vazia: suíte **4.596** (4.566
passam, 29 pulados, **1 vermelho**: o antigo do manual) · `tsc` limpo ·
conformidade **87/87** · roteiro **14/14** · medição **28/28** e **19/28** ·
`programa/` montado. Contagem: `backup/contagem-testes_2026-10-04_22-35_v23.9.tsv`.

### v23.8 — Rodada 8d: a cabeça-malha diz por que o clique leva o osso — 04/10/2026

Pedido do Diretor. Clicar numa peça que não anda sozinha (malha, caixa,
caminho, máscara, ou troca de osso por chave) continua escolhendo o osso junto
— e agora o rodapé diz por quê, na hora: *"head" é uma malha: ela se move pelo
osso dela (head)*. Sem isso o Humberto clicaria na cabeça e acharia que o clique
novo falhou ali. Foto `25`, roteiro `roteiros/lote2b.mjs`.
`doc/own-bone.ts` (`clickKeepsBoneNotice`), `viewport/tools/select.ts`.

Teste novo: `ferramentas` *"a cabeça-malha: o clique escolhe o osso junto, e o
rodapé diz por quê"*.

**Fecho**, 04/10/2026, das 22:10 às 22:13, casa vazia: suíte **4.561** (4.531
passam, 29 pulados, **1 vermelho**: o antigo do manual) · `tsc` limpo ·
conformidade **87/87** · roteiro **14/14** · medição **28/28** e **19/28** ·
`programa/` montado. Contagem: `backup/contagem-testes_2026-10-04_22-10_v23.8.tsv`.

### v23.7 — Rodada 8d, lote 3: o osso próprio no resto do programa — 04/10/2026

Fotos: `backup/fotos-obra/rodada-08d/` (`30`, `31`, roteiro `roteiros/lote3.mjs`).

| # | O que muda | Onde |
|:---:|:---|:---|
| 1 | **A ficha da imagem com osso próprio diz os números dela** (era "X 0, Y 0"): Posição, Rotação e Escala apontam para o osso próprio — na base, a pose de repouso dele; numa animação, a chave dele. Largura, altura e cor continuam do anexo. Vale nas Propriedades e na Ficha rápida | `panels/properties-model.ts` (`throughOwnBone`), `panels/quick-model.ts` |
| 2 | **Apagar a imagem leva o osso próprio**, com as chaves dele; desfazer devolve tudo | `panels/tree-commands.ts` (`DeleteItems`) |
| 3 | **Duplicar ou clonar a imagem leva uma cópia do osso próprio**: a cópia não divide o osso da original. A seleção depois é a imagem nova, sem o osso escondido | `doc/duplicate.ts` |
| 4 | **Pendurar a imagem noutro osso** (P, arrastar na Árvore, o campo Osso) **pendura o osso próprio**, com as chaves; a imagem continua nele e não anda | `doc/reparent.ts` (`reparentTargets`) |
| 5 | As listas de osso das Propriedades não oferecem o osso próprio; no campo Osso do slot ele se lê *"forearm (a imagem anda sozinha)"* | `panels/properties-model.ts` |
| 6 | **O importador do Spriter marca o osso auxiliar de cada sprite** como osso próprio (`visible: false` e a marca do editor), e declara a extensão em `extensionsUsed`. Arquivo importado antes de hoje: o `"<sprite>_osso"` com um slot só, sem filho, de gerador Spriter, é reconhecido pela Árvore e pela folha | `ferramentas/src/importar/spriter.ts`, `doc/own-bone.ts` |
| 7 | O comando que cria o osso próprio também declara `RECORTE_editor_state` em `extensionsUsed` (o validador cobra `EXT_REQUIRED_NOT_USED`) | `doc/own-bone.ts` |

Testes novos: `ferramentas` (5), `importar` (1). Nenhum antigo mudou.

**Fecho**, 04/10/2026, das 22:04 às 22:07, casa vazia: suíte **4.560** (4.530
passam, 29 pulados, **1 vermelho**: o antigo do manual) · `tsc` limpo ·
conformidade **87/87** · roteiro **14/14** · medição **28/28** e **19/28** ·
`programa/` montado. Contagem por arquivo em
`backup/contagem-testes_2026-10-04_22-05_v23.7.tsv`.

**Pela metade, dito às claras:** o arquivo do Spriter importado **antes** de hoje
tem o osso auxiliar sem `visible: false`; a Árvore e a folha o tratam como osso
próprio, mas a cena ainda o desenha e o deixa clicar. Reimportar resolve.

### v23.6 — Rodada 8d, lote 2: clicar na imagem escolhe só a imagem, como no Spriter — 04/10/2026

Fotos: `backup/fotos-obra/rodada-08d/` (`20`–`24`, roteiro `roteiros/lote2.mjs`).

| # | O que muda | Onde |
|:---:|:---|:---|
| 1 | **Clicar numa imagem na cena escolhe SÓ a imagem** (o slot e o anexo), e não mais o osso junto. Numa animação, arrastar cria chave só dela (lote 1); o osso e as outras imagens do osso não andam. Vale igual para a **peça encaixada** (entidade) | `viewport/picking.ts` (`selectionFor`), `viewport/tools/select.ts`, `viewport/viewport.ts` |
| 2 | A imagem que **não anda sozinha** (malha, caixa, caminho, máscara em alguma skin, ou troca de osso por chave) continua levando o osso no clique — senão a cabeça-malha do herói não se moveria mais | `doc/own-bone.ts` (`clickKeepsBone`) |
| 3 | **Com "Ver ossos" ligado, o corpo do osso pega o clique por cima da imagem** — ele é desenhado por cima. A ponta não (80% do comprimento a partir da raiz): ali costuma estar a peça seguinte, como a mão na ponta do antebraço. Clicar no osso e mover continua levando as imagens dele | `viewport/picking.ts` (`bonesOnTop`, `BONE_BODY_SHARE`), `viewport/onion.ts` |
| 4 | **Travar desenhos** (tecla 0): o clique passa pela imagem, como diz a dica; dá para clicar no osso. O sentido do botão não mudou | — (conferido, foto `23`) |
| 5 | A grade do botão direito procura a imagem embaixo do osso; o Posar, clicando numa imagem com osso próprio, posa o osso que se vê; o rodapé do Transformar lê o osso próprio | `viewport/viewport.ts`, `tools/pose-tool.ts`, `tools/transform-tool.ts` |

**Testes reescritos de propósito** (o clique mudou), cada um com o motivo no
texto: `viewport` *"clicking an attachment selects its slot and the image, and
NOT its bone (rodada 8d)"* (era *"…selects its slot and its bone as well"*) ·
`cena-selecao` *"o clique escolhe como numa imagem: o slot e a entidade, sem o
osso (rodada 8d)"* · `arvore` *"clicar num desenho solto escolhe o desenho, e não
a raiz; com Shift, os dois"* (o desenho no `arm` já não traz o `arm`) · `arvore`
*"3.1 clicar numa imagem na cena não escolhe osso"* (o clique já não traz
`braco`) · `arvore` *"3.1 o ponto e a caixa seguem a mesma regra"* (o clique na
imagem escolhe o mesmo que a linha dela na Árvore: o ponto entra no slot dela).
Testes novos: `ferramentas` (4), `cena-selecao` (1). Nenhum apagado nem pulado.

**Fecho**, 04/10/2026, das 21:53 às 21:56, casa vazia: suíte **4.554** (4.524
passam, 29 pulados, **1 vermelho**: o antigo do manual) · `tsc` limpo ·
conformidade **87/87** · roteiro **14/14** (nenhum passo mudou) · medição
**28/28** e **19/28** · `programa/` montado. Contagem por arquivo em
`backup/contagem-testes_2026-10-04_21-54_v23.6.tsv`.

**Achado de passagem, que não é desta rodada:** a espada do herói (entidade com
animação própria) dá um salto de ~1,8 na primeira chave criada em qualquer peça
— também com chave de osso comum, pelo caminho antigo. É o relógio da animação
dela, não a posição. Fica para quem mexer na faixa (8c).

### v23.5 — Rodada 8d, lote 1: a imagem sozinha vira chave, pelo osso próprio — 04/10/2026

Executor: `EXECUTANDO · rodada 8d — mover a imagem cria chave`, sozinho na
máquina. Ficha: `documentos/projeto do programa/rodadas/RODADA 08d - mover a
imagem cria chave como no Spriter 2026-10-04.md`. Fotos: `backup/fotos-obra/rodada-08d/`
(`00`–`04` antes, `10`–`11` depois).

| # | O que muda | Onde |
|:---:|:---|:---|
| 1 | **A imagem escolhida sozinha (Árvore, Ordem), movida numa animação, cria chave só dela.** O formato não tem chave para a posição de um anexo; a imagem ganha **um osso só dela**, filho do osso em que está, na âncora e com o giro dela, e a chave é dele. Nasce no primeiro movimento, **num desfazer só com a chave**. Os anexos do slot, em todas as skins, são reescritos pela conta inversa: nenhum pixel anda. Mover, Girar, Escalar, o Transformar, o grupo de imagens e as setas | `doc/own-bone.ts` (novo), `viewport/tools/attachment-edit.ts`, `translate.ts`, `rotate.ts`, `scale.ts`, `drawing-group.ts` |
| 2 | **O aviso "Posição do desenho é da montagem: ela não vira chave" saiu** | `viewport/tools/attachment-edit.ts` |
| 3 | A marca do osso próprio é do editor: `visible: false` e `extensions.RECORTE_editor_state.ossoProprio`. Provado antes de usar: o validador aceita; desenho igual no runtime TS (0 de diferença), 0 avisos, binário de ida e volta igual; o runtime Python e a exportação não leem `visible` de osso | `doc/own-bone.ts` |
| 4 | **A Árvore não mostra o osso próprio**: a imagem fica debaixo do osso que se vê | `panels/tree-rows.ts` |
| 5 | **A folha chama a linha dele de "Imagem hand"**, e ela aparece em "Mostrar só os escolhidos" com a imagem escolhida | `anim/keying.ts` (`dopesheetGroups`) |
| 6 | O clique não pega osso que não se desenha (`visible: false`), como o retângulo já fazia | `viewport/picking.ts` |
| 7 | Com osso próprio, na **base**, a imagem anda pela pose de repouso do osso dela | as mesmas ferramentas |
| 8 | **Recusa com aviso** (regra 21) quando o slot tem malha, caixa de colisão, caminho ou máscara em alguma skin, ou troca de osso por chave: *"… tem uma malha: a chave só da imagem ainda não vale para ela. Mova pelo osso dela"*. No herói: 19 de 23 slots podem; `head` (malha), `mask`, `hitbox` e `cape_path` não | `doc/own-bone.ts` (`ownBoneRefusal`) |

O clique na cena **ainda** escolhe o osso junto com a imagem: é o lote 2.

Testes novos: `ferramentas` (14), entre eles o Ctrl+Z que devolve os anexos das
duas skins letra por letra, e o osso próprio sem chave que desenha igual.
Nenhum teste antigo mudou.

**Fecho**, 04/10/2026, das 21:38 às 21:42, casa vazia, um processo de cada vez:
suíte **4.550** (4.520 passam, 29 pulados, **1 vermelho**: o antigo do manual)
· `tsc` limpo · conformidade **87/87** · roteiro **14/14** · medição **28/28**
e **19/28** (iguais à v23.4) · `programa/` montado. Contagem por arquivo em
`backup/contagem-testes_2026-10-04_21-39_v23.5.tsv`.

**Os 94 da v23.3, achados (93 deles):** o 4.608 de 29/09 foi a soma de três
rodadas com filtro de caminho (`editor` + `ferramentas` + `runtime`). O filtro
casa pelo texto do caminho: `editor/testes/ferramentas.test.ts` (82) entrou nas
rodadas `editor` e `ferramentas`, e `ferramentas/testes/dois-runtimes.test.ts`
(11) nas rodadas `ferramentas` e `runtime`. Contados duas vezes: 93. Sobra 1
sem explicação.

### v23.4 — Rodada 8a: a entidade se escolhe, se move e volta — 04/10/2026

Executor: `EXECUTANDO · rodada 8a — a entidade se escolhe, se move e volta`,
sozinho na máquina. Ficha: `documentos/projeto do programa/rodadas/RODADA 08a
- a entidade se escolhe se move e volta 2026-10-04.md`. Fotos de antes e de
depois: `backup/fotos-obra/rodada-08a/`.

| # | O que muda | Onde |
|:---:|:---|:---|
| 1 | **O clique na cena acha a entidade.** O clique pulava o anexo `skeleton` (não tem vértices: quem desenha é o filho). Agora desce no filho e testa o que ele desenha, com a regra do pixel transparente; a caixa da entidade no mundo é a caixa desses desenhos. Escolhe como numa imagem: o osso, o slot e a entidade | `viewport/picking.ts` (`nestedContains`, `nestedBox`, `attachmentWorldPoints`) |
| 2 | **O botão direito abre a grade sobre a entidade** (era *"Não há ferramenta anterior para voltar"*) | `viewport/viewport.ts` (`gridTarget` no lugar de `pickerTarget`) |
| 3 | **"Tirar a entidade": a imagem de antes volta, como era.** A troca guarda a imagem que sai em `extensions.RECORTE_editor_state.imagemDeAntes` do próprio anexo — estado só do editor, fora do núcleo. Porta no botão direito (embaixo da grade) e no menu Esqueleto. Entidade que entrou direto diz por que não há volta | `panels/image-picker-model.ts` (`TakeOutEntity`, `takeOutEntity`), `panels/palette-actions.ts`, `ui/menus.ts` |
| 4 | **Mover, Girar e Escalar mexem na entidade** escolhida sozinha (Árvore ou Ordem): `x, y, rotation, scaleX, scaleY`, os mesmos da imagem. Clicada na cena, ela leva o osso junto, como a imagem — e na animação isso vira chave do osso. A linha da Ordem (só o slot) agora também arrasta | `viewport/tools/attachment-edit.ts` |
| 5 | **Um arrasto de desenho, um desfazer.** `x` e `y` iam em dois comandos que não se juntavam: um arrasto deixava dezenas de passos. Valia para a imagem também | `viewport/tools/attachment-edit.ts` (`SetProperties`) |
| 6 | **Propriedades e Ordem dizem o nome da entidade** ("Entidade: espada", "Osso: head · entidade espada", "entidade espada" na Ordem). Propriedades da entidade ganham Posição X/Y, Rotação e Escala | `panels/properties-model.ts`, `panels/properties.ts`, `panels/draw-order.ts` |
| 7 | **O que não passa da imagem para a entidade se diz em português**, antes: *"Não passam para "espada": 3 chaves de deformação (animação idle), 1 malha ligada e 1 alvo de morph…"*. Os três avisos do leitor saem traduzidos | `panels/image-picker-model.ts` (`entityLosses`), `panels/warning-model.ts` |

Testes novos: `cena-selecao` (7), `grade-de-imagens` (8), `paineis` (3),
`acabamento` (2), `existir-nao-e-funcionar` (a ação nova com estado).

**Fecho**, 04/10/2026, das 21:05 às 21:10, casa vazia, um processo de cada vez:
suíte **4.536** (4.506 passam, 29 pulados, **1 vermelho**: o antigo do manual,
de 15/09) · `tsc` limpo · conformidade **87/87** · roteiro **14/14** · medição
**28/28** de lado e **19/28** de altura (iguais à v23.3) · `programa/` montado.
Antes desta rodada a suíte tinha 4.514; a v23.3 dizia 4.608 em 29/09, e nenhum
arquivo de teste nem de dados mudou desde então fora os desta rodada — a
diferença não é daqui, e a causa **não foi achada**.

**O Spriter, lido no manual oficial 1.4** (`documentos/pesquisa/nova pesquisa/spriter/`,
páginas do PDF): o manual **não tem seção de sub-entidade** (o índice, p. 1,
não lista nenhuma). **P. 9:** *editar qualquer sprite ou osso cria a chave
sozinho* — no Spriter o sprite tem posição própria por chave. **P. 11:** a
troca de imagem é escolher o sprite com clique esquerdo na tela e clicar com o
botão direito numa imagem do palette, no tempo escolhido; a imagem nova entra
pelo pivô. O nosso formato não tem chave para a posição de um anexo; o
importador do Spriter resolve dando a cada sprite um osso próprio
(`ferramentas/src/importar/spriter.ts`, perto da linha 466). Por isso, por
decisão do Diretor, **a chave da posição (da imagem e da entidade) saiu desta
rodada** e vai como pergunta ao Humberto, com a sugestão do osso próprio.

**O que ficou de fora, de propósito:** a Árvore ainda mostra o nome do anexo
("face") na linha do desenho; mexer numa imagem ou entidade **solta do osso**
numa animação grava na base (o formato não tem chave para a posição do anexo —
pergunta para o Diretor); a entidade não vira base na lista (8b); a faixa (8c).

### v23.3 — O fecho 3: a versão que vai para a mão do Humberto — 29/09/2026

Fechada pelo `EXECUTANDO · as portas das regras` (chat C, o fechador, P51),
sozinho, com a casa parada. **Depois deste fecho a casa para**: o Humberto abre
o programa e olha. As sete seções *v23.3* logo abaixo são uma por lote, escritas
pelos donos: a casca (4), o chat E (2) e o chat H (1).

**A medição, pela régua da memória (P63): memória livre antes de cada passo,
medida À PARTE do comando, um processo de cada vez, `vitest` com um trabalhador.**

| Passo | Hora | Memória livre | Resultado |
|:---|:---|:---|:---|
| `tsc` | 10:31:07–10:31:16 | 677 MB | limpo |
| suíte `ferramentas` | 10:32:49–10:33:49 | 518 MB | 921 de 921 |
| suíte `runtime` (o leitor) | 10:34:02–10:34:22 | 765 MB | 543 de 543 |
| conformidade | 10:34:34 | 923 MB | 87 de 87 |
| roteiro | 10:34:49 e 10:35:43 | 493 e 1.052 MB | **14 de 14, as duas vezes** |
| medição | 10:36:40–10:37:13 | 1.558 MB | 28 de 28 sem passar da coluna; 19 de 28 cabem na altura (remedida: `ui/shell-status.css` é novo) |
| suíte `editor`, **depois da última gravação** | 10:37:29–10:38:14 | 806 MB | 3.144: 3.114 verdes, 29 pulados, **1 vermelho** — `exportar-e-ajuda.test.ts`, *"the manual page"*, o do manual pausado |
| **suíte inteira** | — | — | **4.608** (3.144 + 921 + 543). Era 4.545 na v23.2: nenhum sumiu |

**Um vermelho novo, consertado pelo dono durante o fecho:**
`tema-e-ficha.test.ts:186`, *"o que foi escolhido de verdade é lembrado"*,
comparava as preferências inteiras e recebeu o campo novo `nextStep` (a dica do
passo seguinte, P19). A casca acrescentou o campo ao esperado, com o motivo, às
10:34 (49 de 49). A primeira suíte do editor (10:31, 1.007 MB) tinha 2
vermelhos; a de 10:37, só o do manual.

**Dois testes mudaram de número de propósito** (P15a — trocar a imagem põe o
pivô da nova onde estava o da velha): `grade-de-imagens.test.ts` (chat H) e
`pasta-do-projeto.test.ts` (chat E), de (10; −20) para (14; −11), com a conta
escrita no comentário. O nome do de `pasta-do-projeto` diz a regra nova; o de
`grade-de-imagens` diz só *"cai pelo pivô"* — a regra está no comentário.

### v23.3 — Trocar a imagem não pula, e o rodapé do pivô diz de onde para onde — 29/09/2026

Pelo `EXECUTANDO · imagens e pivô` (chat H da rodada final), gravado e medido
entre 10:26 e 10:28. É o chat H fazendo APARECER na tela os dois consertos do
chat E (`io/pivot-model.ts`): o `swapImage` com a região da imagem que sai
(P15a), e o `pivotNotice` com os movimentos. Defeitos H1 e H2 (a metade do
rodapé). A frase *"A imagem não sai do lugar"* foi **cancelada** (P65, P67):
acertar o pivô continua recolocando o desenho, como no plano de 10/09.

🗣️ *"Troquei a mão aberta pela fechada, e ela ficou no lugar."*

| Defeito | Antes | Depois |
|:---|:---|:---|
| **H1** trocar a imagem de um desenho solto | a mão em (150, 100), mesmo pivô, ia para (0, −12): o pivô novo caía na origem do osso | fica em (150, 100): o pivô da nova cai onde estava o da velha, como o Spriter diz (*Swapping the Image of a Sprite*) |
| **H2** o rodapé do pivô | *"1 desenho recolocado"*, sem dizer para onde | *"2 desenhos recolocados, de (150; 100) para (0; 20) e mais 1"* |

| Onde | O quê |
|:---|:---|
| `panels/palette-model.ts` | `outgoingRegion` (novo): a região da imagem que sai, lida antes da troca · passada nos dois ramos do `SwapSlotImage` e no `SwapFolderImages` |
| `panels/image-picker-model.ts` | a mesma, no `SwapImageAsKey` |
| `panels/palette.ts`, `pivot-panel.ts` | as três chamadas do `pivotNotice` levam `{ moves: command.moves }` |
| `editor/testes/pivo.test.ts` | 4 casos novos: a troca não pula pelos três caminhos, e o rodapé |
| `editor/testes/grade-de-imagens.test.ts` | o caso "a 3ª miniatura" muda de conta **de propósito**: (10; −20) → (14; −11), com a conta escrita no teste |

**Vistos falhar antes:** H1 por uma sonda de fora da casa, no código de 10:26 —
`"x":0,"y":-12`. O rodapé: as três chamadas eram `pivotNotice(…, command.moved)`,
que o teste novo conta e recusa.

**Medido, um processo de cada vez (P63):** 10:27 — `pivo.test.ts` 77 de 77
(memória livre antes: 1172 MB); `grade-de-imagens.test.ts` 48 de 48, depois
de acertar a conta de propósito (483 MB); 10:28 — `tsc` limpo (1030 MB).

**Vermelho que vai aparecer, e não é meu arquivo:** `pasta-do-projeto.test.ts:520`
("escolher outra mão… cai pelo pivô") prova a regra velha, com o mesmo boneco.
Pela P15(a) os números passam a ser **14 e −11** (hoje 10 e −20). Dono: chat E.

**Sem foto: fica para o turno inteiro do chat H, logo depois do fecho da v23.3.**


### v23.3 — O projeto do Spriter entra visível, e o Salvar guarda os quadros (E2, E3, J5, E4, E5) — 29/09/2026

Pelo `EXECUTANDO · arquivo e importar` (chat E). **O código de E2, E3, J5 e E4
já está na v23.2**; a seção não foi escrita antes do travamento das 05:57, e
entra aqui. O E5 é novo.

| # | Antes | Agora |
|:---:|:---|:---|
| E2 | o projeto de verdade do Spriter (`exemplo/game`) entrava INVISÍVEL: 176 avisos *"image not found in any atlas"* | as imagens soltas vão para a aba Imagens, com o caminho que o `.scml` escreve, e as que o boneco usa vão para a cena. Sobram 2 avisos, da única imagem que não existe (um arquivo sem extensão no disco). O rodapé diz, numa frase só, quantas faltam, quais, e onde procurou |
| E3 | soltar uma PASTA na janela entregava só o nome dela | o arrasto desce nas subpastas (`io/drop-folder.ts`) |
| J5 | soltar a miniatura da aba Imagens na cena dava um erro falso: a janela tratava o mesmo soltar | a janela deixa passar todo arrasto `text/x-recorte-*` (imagem, entidade, pele) |
| E4 | **o Salvar perdia os quadros de toda sequência** — pasta numerada e folha do Aseprite —, porque as imagens em uso eram contadas pelo prefixo (`olho_`); e contava uma caixa como imagem | `imagesOfAttachment`: a sequência são os quadros; caixa, ponto, recorte e caminho não têm imagem |
| E5 | **salvar a folha do Aseprite estragava todos os quadros, calado**: depois de reabrir, cada quadro era a tira inteira, e o rodapé dizia "Nenhum aviso" | o Salvar lê o retângulo do quadro, e não a página (`regionCrop`), e devolve o corte do Aseprite ao tamanho original |

**O E4 é o mais grave da rodada, e entrou na v23.2.** Os leitores da conta que ele consertou, avisados (regra 25): o Salvar (`io/folder-save.ts`, `atlasForSave`), o "Trocar a pasta de origem" da aba Imagens (`panels/palette.ts`, chat H) e o importador do Spriter (E2). A prova que fica: `arquivo.test.ts`, *"o Salvar leva os quadros da pasta numerada, e não a imagem que só tem nome de caixa"*; a ida e volta INTEIRA, salvar e reabrir de verdade, está no preparo `v23.2_e4.js`, que o chat C leva para `ferramentas/provas/`. O J5 também está no disco e medido: `arquivo.test.ts`, *"o arrasto de DENTRO do programa não é tratado pela janela (J5)"*.

As formas (regra 27): *contei o nome do anexo como nome de imagem* (E4) · *li a
página no lugar da região* (E5). O E5 só apareceu porque a prova de ida e
volta rodou no programa montado, com salvar e reabrir de verdade.

| A medida que fica | Onde |
|:---|:---|
| a lógica do Spriter fora do navegador: 25 ms, 87 de 88 imagens | `arquivo.test.ts`, "o projeto do Spriter do Humberto entra com as imagens (E2)" |
| a sequência e a caixa em uso; o recorte de cada quadro no Salvar | `arquivo.test.ts`, (E4) e (E5) |
| o arrasto de pasta, com lotes de leitura | `arquivo.test.ts`, (E3) |

**O que ficou aberto: E6.** O projeto do Spriter INTEIRO trava a página num
Chrome sem placa de vídeo (cada imagem do jogo tem 1664×1157). Com 10 imagens
entra e aparece (foto `E2_dez.png`); com 20, não. A medir com placa de vídeo.

Fotos: `backup/fotos-rodada-final/arquivo/` — `E2_antes.png`, `E2_dez.png`,
`E5_antes.png` (programa v23.2), `E5_depois.png`, `v23.2_folha.png`.

### v23.3 — O pivô não faz pular, o aviso de exportar não mente, e o .bone abre com as imagens (H1, H2, N-6, N-14, J1, P43) — 29/09/2026

Pelo `EXECUTANDO · arquivo e importar` (chat E).

| # | Antes | Agora |
|:---:|:---|:---|
| H1 | trocar a imagem de um desenho solto fazia ele pular 12 px, com o mesmo pivô | `swapImage` aceita a região da imagem que SAI (5º parâmetro, opcional): o pivô da nova cai onde estava o da velha, como o Spriter diz. O chat H passa a região velha nas três chamadas dele |
| H2 | acertar o pivô recolocava o desenho (o solto também, que é o plano de 10/09) e o rodapé dizia só "1 desenho recolocado": a cabeça foi de (150, 100) para (0, 28) sem ninguém saber | o comportamento NÃO muda (P67: se o solto deve ficar parado é pergunta ao Humberto). O comando guarda de onde para onde (`moves`), e o rodapé diz: *"1 desenho recolocado, de (150; 100) para (0; 28)"*, com uma casa depois da vírgula. A janela do chat H ganha os dois números (`pivotUsersSplit`: presos a osso, soltos no raiz) |
| N-6 | com "Todas as animações", o aviso dizia "Tamanho de cada quadro: 114 por 242", e saíam 156 e 295 | uma linha por animação; "igual nas N" quando for |
| N-14 | a receita do ffmpeg/MP4 em toda exportação, GIF e folha inclusive | só na sequência de PNG, que é o que o ffmpeg lê |
| J1 | "Abrir projeto…" com só o `.bone` vinha sem imagem, e o aviso dizia "Abra o atlas junto", sem onde | se a pasta do `.bone` está entre as lembradas e a permissão já está dada, o atlas e as páginas vêm de lá. Se não, o aviso diz o gesto e o nome da pasta: *"Arquivo → Abrir pasta do projeto… e escolha a pasta boneco"* |
| P43 | o "salvar com avisos?" era um `confirm()` do navegador, cortado em 8 avisos | `problemsQuestion(problems)` devolve a pergunta como dado, com TODOS os avisos, para a janela da casa; o `confirm()` fica só como último recurso |

As formas: *pus o pivô na origem do osso, e não onde ele estava* (H1) · *disse
o primeiro como se fosse o de todos* (N-6).

Testes, todos acrescentados: `arquivo.test.ts` (H1, J1, P43) e
`exportar-e-importar.test.ts` (N-6, N-14).

### v23.3 — "Agora não" guarda o rascunho à parte, e a janela mostra todos (P55, A2-1) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 10:20. Decisão do
Planejador: *nada que o Humberto fez se perde sem ele mandar*.

**Antes:** o rascunho era UM só. Herói mexido → recarregar → "Agora não —
guardar o rascunho" → abrir outra coisa e mexer: o trabalho novo gravava por
cima do guardado, calado. A janela prometia "guardar" e perdia. A forma: *a
promessa "guardar" morava num lugar que o próximo trabalho ocupava*.

**Depois:** "Agora não" guarda uma **cópia** numa lista à parte (o atual
continua no lugar, como o roteiro confere desde o A2). A janela seguinte
mostra **todos**, um botão por trabalho, com nomes que nunca saem iguais (os
segundos entram quando o nome e o minuto empatam, e o mais novo diz *"o mais
recente"*). Recuperar um guardado troca de lugar com o atual: nada some.
Salvar apaga só o atual; os guardados ficam até a pessoa mandar apagar. Velho
de mais de sete dias sai sozinho. **Arquivo → Reabrir o fechado** também acha
o guardado, quando o atual está vazio (antes diria "não há nada guardado" —
e havia).

**Prova:** 11 testes novos em `documento.test.ts`; o primeiro mostra o caminho
velho perdendo o trabalho.

**Fotos:** o mesmo gesto nos dois: antes
`backup/fotos-rodada-final/defeitos/p55_antes.png` (v23.2: a janela oferece
UM, o outro sumiu), depois `p55_depois.png` (dois botões distintos). A
primeira foto de depois mostrou dois botões **iguais**; está em `descartadas/`,
e foi o que levou ao `draftLabels`.

### v23.3 — A chave de ordem e a da virada de corpo se mostram (P12) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 10:16. A função
`revealKey` é do chat D (`anim/keying.ts`); a casca a chama.

**Antes:** com uma animação aberta, mudar a ordem de desenho (ou "Colar corpo
aqui") grava uma chave que **não se vê na cena**, e com a linha do tempo em
Resumo ela era um losango a mais e nada: "criei e sumiu". Arrastar na aba
Ordem ainda não dizia nada no rodapé. **Depois:** a linha do tempo abre os
Detalhes, escolhe a chave e rola até ela. O arrasto na aba Ordem diz *"Chave de
Ordem de desenho criada em 0,40 s"*.

**Prova:** 3 testes em `ordem.test.ts` — com animação aberta a linha do tempo
é chamada com a chave certa; com a base aberta, nada; e o "Colar corpo aqui"
chama com o tempo de antes de colar.

**Fotos:** o mesmo gesto (herói, `walk` em 0,4 s, Esqueleto → Trazer para a
frente): antes `backup/fotos-rodada-final/defeitos/p12_antes.png` (v23.2, a
faixa fica em Resumo), depois `p12_depois.png` (os Detalhes abertos na linha
"Ordem de desenho", a chave de 0,40 s acesa).

### v23.3 — O rodapé diz o passo seguinte (P19) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 10:02. Arquivo novo
`ui/next-step-model.ts`.

🗣️ *"Quero fazer um arroz. Eu pego uma panela, boto água, boto no fogão,
quando a água estiver fervendo eu boto o arroz. No programa, eu sinto que não
tem panela, que não tem arroz."* — o Humberto, 28/09. E: *"não tem uma
sequência de como executar aquela tarefa"*.

**Antes:** o rodapé dizia ONDE se estava (*"Base: heroi — Mexer grava na
base"*) e nada sobre o que vem depois. Abrir o herói, criar a animação e
posar o primeiro quadro não apontava o caminho seguinte (K4); uma animação
nova não repetia e nada dizia (K6).

**Depois:** a linha da ferramenta, no rodapé, diz o **passo seguinte** com o
caminho de clique, na ordem do Spriter (as filas dos chats J e K, com link para
o manual oficial):

| Falta | O rodapé diz |
|:---|:---|
| imagem nenhuma | *Próximo: traga as imagens — Arquivo → Abrir pasta do projeto…* |
| imagem fora da cena | *Próximo: ponha uma imagem na cena — arraste da aba Imagens para a cena* |
| osso nenhum | *Próximo: crie os ossos — ferramenta Criar osso (B)…* |
| imagens soltas na raiz | *Próximo: ligue as imagens aos ossos — escolha o osso, segure P e clique na imagem…* |
| nunca salvo | *Próximo: salve o boneco — Arquivo → Salvar (Ctrl+S)* |
| animação nenhuma | *Próximo: crie uma animação — Animação → Nova animação* |
| a base aberta | *Próximo: abra uma animação — clique no nome dela, na aba Animações* |
| chave nenhuma | *Próximo: pose o boneco — mexa num osso: a chave nasce sozinha* |
| chave num instante só | *Próximo: ande no tempo e pose de novo…* |
| não repete | *Esta animação para no fim — toque com Espaço. Para um ciclo: Animação → Repetir (L)* |
| tudo pronto | *Próximo: toque para ver — Animação → Tocar / Pausar (Espaço)* |

O primeiro buraco da fila ganha. A frase da ferramenta, quando há (Inclinar
sem osso), tem prioridade. A dica só sugere e nunca faz; o que ela não sabe
medir (se a pose está boa) ela não diz. A frase inteira fica na dica do
rodapé. **Desliga em Editar → Preferências → "Mostrar o passo seguinte"**
(ligada por padrão).

**Prova:** 11 testes novos em `acoes.test.ts` — a fila na ordem, o herói na
base (K4), a animação sem repetir (K6), e que **todo caminho "Menu → Item"
que a dica escreve é o nome de verdade no menu** e toda ação citada está na
tabela: a dica não pode apontar uma porta que não existe.

**Fotos**, uma por estado, em `backup/fotos-rodada-final/defeitos/p19-*.png`.

**O ajuste da cor (10:11), pedido do Planejador olhando a foto:** a dica saía
em cinza claro, no mesmo peso do resto do rodapé. Agora **"Próximo:"** vai em
negrito e na cor de destaque da casa, e o resto na cor normal do texto; a
altura do rodapé não muda. Arquivo novo `ui/shell-status.css` (o `shell.css` é
do chat P). Par de fotos: antes `p19-4-imagens-soltas.png`, depois
`p19-cor_depois.png`, o mesmo estado.

**A frase que cabe (P66, 10:27):** com os três campos do rodapé brigando por
largura, a dica longa era cortada no fim — e perdia justamente o caminho de
clique (*"…(Esqueleto → Vi…"*). Agora a frase que se LÊ tem no máximo 80
letras, o gesto primeiro e um caminho só (*"Próximo: ligue as imagens aos
ossos — segure P e clique na imagem"*); o caminho inteiro, com o menu, fica na
dica ao passar o mouse. Um teste confere o limite em todas as frases. Foto no
mesmo estado: `p66_depois.png`.


### v23.3 — "De outro programa…" traz as imagens soltas, como o arrasto (E3b) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 10:13. A função é do chat E
(`adoptForeignImages`, `io/import-foreign.ts`); a casca só a chama.

**Antes:** um projeto do Spriter (`.scml` com as imagens em subpastas) aberto
por **Arquivo → Importar → De outro programa…** abria o boneco **sem desenho
nenhum**: o menu fazia só o passo 1 (ler o `.scml`), e as imagens soltas só
entravam pelo arrasto. **Depois:** o menu faz o passo 2 logo depois de abrir,
igual ao arrasto. As imagens vão para a aba Imagens, as que o boneco usa
aparecem na cena, e o rodapé diz o andamento (*"Lendo as imagens… 12 de 40"*)
e o resultado, com as que faltaram.

**Prova:** 2 testes novos em `acoes.test.ts`, que leem a função: o passo 2 vem
DEPOIS do `setFile`, e o rodapé diz o andamento.

**Sem foto:** o gesto pede o seletor de arquivos do Windows, que nenhum chat
abre (ordem do Humberto). A foto fica para o chat de uso, com o seletor
trocado por script, como no roteiro.

### v23.2 — O fecho 2 da rodada final: dez donos, uma versão — 29/09/2026

Fechada pelo `EXECUTANDO · as portas das regras` (chat C, o **fechador**, P51),
sozinho, com os outros chats parados. As seções *v23.2* logo abaixo são uma por
lote, **escritas por cada dono**: casca, B, C, D, E, F, G, H, I e P. As duas do
chat D sem o número no título ("Lote 2a", "Lote 2b") também entram nesta versão.

**A medição, pela régua da memória (P63): memória livre antes de cada passo, um
processo de cada vez, `vitest` com um trabalhador, somado por pasta.**

| Passo | Hora | Memória livre | Resultado |
|:---|:---|:---|:---|
| `tsc` | 09:52:24–09:52:34 | 1.210 MB | limpo |
| suíte `editor` | 09:52:35–09:53:09 | 1.239 MB | 3.081: 3.051 verdes, 29 pulados, **1 vermelho** — `exportar-e-ajuda.test.ts`, *"the manual page"*, o do manual pausado (regra 11) |
| suíte `ferramentas` | 09:53:17–09:54:15 | 1.346 MB | 921 de 921 |
| suíte `runtime` | 09:54:15–09:54:34 | 1.271 MB | 543 de 543 |
| **suíte inteira** | — | — | **4.545** (543 + 3.081 + 921). Eram 4.268 às 04:55: nenhum sumiu |
| conformidade | 09:43:19 | 899 MB | 87 de 87 |
| roteiro | 09:54:41 e 09:55:18 | 1.168 e 1.535 MB | **14 de 14, as duas vezes** |
| medição | 09:47:41–09:48:13 | 1.587 MB | 28 de 28 sem passar da coluna; 19 de 28 cabem na altura. Nenhum CSS mudou depois |

**Três vermelhos consertados durante o fecho, cada um pelo dono:**

| Vermelho | Dono | Conserto |
|:---|:---|:---|
| `existir-nao-e-funcionar.test.ts` ×2: a ação `limpar-guias` que ninguém exercitava | chat I | a ação ganhou o estado e passou a exigir o efeito (09:42) |
| `tarefas.test.ts` ×2: as cinco `fim-*` do "No fim" sem nome de tarefa | chat C (`ferramentas/provas/`, P44) | cinco linhas em `tarefas.ts` (09:43) |
| roteiro, passo 14: *"sem a animação animação na lista"* | chat G | reabrir a pasta abria o campo de nome como se fosse animação nova; só a Nova animação pede o nome agora (09:51) |

O terceiro foi achado pela **caixa da queda** do roteiro (C3): a frase ficou
guardada em `backup/provas-quedas/roteiro/2026-09-29_094400_passo-14/`, com a
foto. Até a madrugada, uma queda dessas se perdia.

### v23.2 — Trazer a arte e marcar o pivô: a troca que grava na pele certa, e o pivô que se acha — 29/09/2026

Pelo `EXECUTANDO · imagens e pivô` (chat H da rodada final), lote 3, gravado
entre 05:01 e 05:24; escrito às 09:37 sobre o que está no disco. Referência e
fila com as quatro perguntas:
`documentos/pesquisa/nova pesquisa/SEQUENCIA imagens e pivo 2026-09-28.md`
(Spriter, *Setting Default Pivot Points* e *Swapping the Image of a Sprite*;
Spine, *Images* e *Tools — Numeric entry*). Decisões P27 e P33.

🗣️ *"Fiz uma pele para trocar a roupa, e a roupa trocou na pele."*

**Trocar a imagem**

| Defeito | Antes | Depois |
|:---|:---|:---|
| **K15** troca no meio da animação | uma chave só, em 0,5 s: o runtime a segurava desde 0, e o rosto já era o novo em 0,00 s | a imagem de antes fica gravada em 0 s (`keepStartKey`), no mesmo passo de desfazer |
| **M2 / I-O2** trocar com o lápis numa pele | a troca caía na `default`, e a pele ficava com 0 desenhos | grava na **pele do lápis** (P27). Sem o desenho lá, ele é copiado e trocado no mesmo passo; o desfazer devolve o arquivo letra por letra, sem desenho órfão. A `default` fica intacta. Vale também com animação aberta |
| **M2** o rodapé | *"body/body agora mostra arm"* | diz a pele: *"…, na pele "roupa""* |
| **K12** a chave da troca | nascia e não se via | a linha do tempo abre os Detalhes, escolhe a chave e rola até ela (`revealKey`) |
| **Q5** "Usar no desenho escolhido" | apagado logo depois de soltar a peça (ela nasce com o slot escolhido, sem o desenho) | aceso: o slot sozinho vale pelo desenho que mostra |

**O pivô à mão**

| Defeito | Antes | Depois |
|:---|:---|:---|
| **Q1 / J7** duplo clique na miniatura | nada acontecia (no Spriter abre o pivô) | abre a janela Definir pivô…; a dica ensina |
| **Q2** setas | a cruz não andava, nem na janela nem no painel Pivôs | setas = 1 px, Shift+setas = 10 px, como o Spine; no painel, cada seta é um passo de desfazer |
| **Q3** Copiar / Colar pivô | Copiar **calava** na imagem só da pasta; Colar dizia *"copie primeiro"* | valem na imagem da pasta, e sempre dizem o que fizeram (*"ainda não tem pivô: copiado o centro"*) |
| **Q4** a cruz na miniatura | o pivô gravado não aparecia na aba Imagens | aparece, como na grade do painel Pivôs |
| **Q6 / J7** os ícones Carimbar e Definir pivô | espremidos a 4 px: viravam pontinho | 18 px: o campo de busca é que cede |
| **Q7** o painel Pivôs | nove pontos por cima da caixa Repetir | prévia e nove pontos lado a lado; o que não cabe se corta, nunca cai em cima do vizinho |
| o número do clique | *"30, 1,8381"* | o clique cai no pixel inteiro |

**O pivô com a aba fechada (P33)**

| Ação | Menu (gravado pela casca) |
|:---|:---|
| `definir-pivo` · `carimbar-pivos` | Esqueleto |
| `recarregar-pasta` · `trocar-pasta-origem` | Arquivo, depois de Abrir pasta do projeto… |

As quatro nascem no arranque (`panels/palette-actions.ts`), e a aba chama as
mesmas contas. **Trocar pasta de origem** diz antes de abrir o seletor
(*"Escolha a pasta nova. As imagens trocam pelo nome do arquivo."*), diz
*"Nada mudou."* se cancelar, e diz quando o seletor não abre — em vez de
soltar um erro depois do teste.

| Onde | O quê |
|:---|:---|
| `panels/palette-model.ts` | `SwapSlotImage` ganha `into`, a pele do lápis (opcional) |
| `panels/image-picker-model.ts` | `SwapImageAsKey`: `keepStartKey` e `into` · `targetOfSlot` |
| `panels/image-picker.ts` | `targetOfSelection` aceita o slot · `swapSkinFor` · `naPele` · `revealKey` |
| `panels/palette.ts` | duplo clique · Copiar/Colar pela pasta · cruz na miniatura · as contas da aba em funções soltas |
| `panels/palette-actions.ts` | novo: as quatro ações de arranque |
| `panels/pivot-dialog.ts`, `pivot-panel.ts` | `nudgePivot`, `snapPivot`, o foco da prévia |
| `panels/palette.css`, `pivot-panel.css` | botões que não encolhem · prévia lado a lado |
| de passagem | `ui/actions-table.ts`, `ui/register-actions.ts`, `ferramentas/provas/tarefas.ts`, `editor/testes/acoes.test.ts` (+4 nas duas contas) |
| `editor/testes/pivo.test.ts`, `grade-de-imagens.test.ts` | 22 casos novos, um por defeito |

**Vistos falhar antes:** K15 e M2 por uma sonda de fora da casa, no código
velho, às 05:01 — uma chave só em 0,5 s; a troca na `default` e a pele vazia.

**Medido:** 05:12 — `pivo`, `grade-de-imagens`, `fronteiras` 130 de 130; `tsc`
com um erro só, alheio (`exibicao.test.ts:864`, gravado às 05:12). 05:16 —
`acoes.test.ts` verde, com 226 e 74. **Não medi** o que gravei às 05:19 (o foco
da prévia) e às 05:24 (o seletor que não abre, e o teste dele): o computador
travou às 05:57, e a casa proíbe medir com menos de 2 GB (P61).

**A forma do meu erro (regra 27):** *registrei a ação antes de ela ter linha na
tabela.* Gravei `palette-actions.ts` às 05:01, antes do aviso "menus gravados",
e o teste que lê o código-fonte acusou quatro ações sem porta na tela da casca.
E a segunda: *um passo da fila de fotos apertava Esc para fechar o menu* — o Esc
desmarca a peça, e a foto mostrava o item apagado por causa da foto, não do
programa.

**Fotos** em `backup/fotos-rodada-final/imagens-e-pivo/`, de 05:21: `lote-3_01`
(os ícones), `_02` (duplo clique), `_03` (setas), `_05` (a cruz), `_06` e `_07`
(Copiar e Colar avisam), `_09` (Usar no desenho escolhido aceso), `_12` (M2: o
rodapé diz *"na pele "pele""*), `_17` (o painel Pivôs), `_18` (setas no painel).
Os "antes" são as do lote 2 (`lote-2_03`, `_05`, `_07`, `_09`, `_12`, `_16`,
`_19`). **Sem foto: K15 e K12 (a fila trocou pela imagem que já estava:
`lote-3_14` a `_16` não valem) — o computador travou às 05:57; a foto entra no
turno seguinte.**

**Continua aberto:** a região velha no `swapImage` e a frase *"A imagem não sai
do lugar. Quem anda é a cruz."* esperam o conserto do chat E (H1, H2, P15).

### v23.2 — A animação nasce em laço, e a lista acompanha o Repetir — 29/09/2026

Pelo `EXECUTANDO · animações, prévia e curvas` (chat G da rodada final), lote 3,
escrito às 09:34 sobre o que está no disco desde 06:06. Defeitos K6 e K7, e a
decisão P18. Referência: Spriter, *SCML Reference* — o `Animation` nasce com
`loopType=LOOPING` (https://www.brashmonkey.com/ScmlDocs/ScmlReference.html).

🗣️ *"Criei o andar, toquei, e ele repete."*

| Defeito | Antes | Depois |
|:---|:---|:---|
| **K6 / P18** animação nova | nascia **sem laço**: tocava e parava no fim, e nada avisava | nasce com `loop: true`, campo que o formato **já tem** (`animation.loop`). **Nenhum campo novo** |
| **K6** o aviso | *"Abriu a animação 'animação'"* | *"Animação 'animação' criada, em laço. Escreva o nome e aperte Enter"* |
| **K7** a etiqueta "repete" | ligar o Repetir não a acendia na lista; só depois de trocar de animação e voltar | acende na hora: a lista também ouve a mudança `transform`, que é o tipo do comando do Repetir |

| Onde | O quê |
|:---|:---|
| `panels/animations-model.ts` | `AddAnimation` grava `loop: true` · `createdNotice` |
| `panels/animations-actions.ts` | `addAnimation` escreve o aviso depois de abrir |
| `panels/animations.ts` | `listensTo` ganha `'transform'` |
| `editor/testes/animando.test.ts` | `describe` "nasce em laço, e a lista acompanha o Repetir" — 3 casos. **Vistos falhar antes** (05:26, 3 vermelhos) |

**Medido às 06:06–06:07, sem servidor:** `animando.test.ts` 101 de 101 ·
`acoes.test.ts` 22 de 24 (os 2 vermelhos são das ações `fim-*` do chat D) ·
`tsc` limpo.

**A forma do meu erro (regra 27):** *gravei o uso e parei antes da importação.*
Das 05:27 às 06:06 o `animations-actions.ts` chamava `createdNotice` sem
importá-lo: o `tsc` caiu, e dois testes de `acoes.test.ts` com ele, na tela de
cinco chats. Escrever e medir na mesma volta (regra 29) teria pegado isso no
mesmo minuto.

**Sem foto: a casa parou às 06:10; a foto entra no turno seguinte.**

### v23.2 — A cena diz o que fez: o recado que não morre, e a regra que segura o osso — 29/09/2026

Pelo `EXECUTANDO · cena e ferramentas` (chat F da rodada final), lote 3, versão A,
gravado entre 05:15 e 05:56. Defeitos F1, F2, F3 (chat F), A4 (chat A), H3 (chat H),
L10 e L11 (chat L). Referência e fila com as quatro perguntas:
`documentos/pesquisa/nova pesquisa/SEQUENCIA cena e ferramentas 2026-09-28.md`.
Plano: `documentos/planos/PLANO chat F lote 3 cena 2026-09-29.md`.

| # | O que mudou | Onde |
|:---:|:---|:---|
| F1 · F2 | **O recado do gesto chega ao rodapé.** Com o botão apertado, a cena remonta a pose a cada quadro, e isso apagava o recado no mesmo quadro em que nascia. "Segure Alt e arraste para desenhar a caixa" e "Girar 44,1°" existiam e ninguém lia. Agora o último recado do gesto volta ao soltar | `viewport/gesture-notice.ts` (novo), `viewport/viewport.ts` |
| F3 · L10 · L11 | **Mexi e a regra desfez: agora ele avisa.** Girar a cabeça do herói gravava −53,8° e a tela não mudava (`look_driver`); o braço, o mesmo (`ik_arm`). Ao soltar, a cena mede a pose aplicada contra a pedida e, se não bateu e uma regra cita o osso, diz: *"head não girou: as regras head_lean, look_driver mandam nele. Desligue o olho delas na aba Regras. Ficou na base: Ctrl+Z desfaz"*. Não se adivinha: sem regra citada, não há recado. Não desliga regra nenhuma | `viewport/held-by-rule.ts` (novo), `viewport/viewport.ts` |
| A4 | **Desfazer não deixa `shearX: 0`** onde o campo não existia. O desfazer escrevia o valor padrão; agora tira o campo. O arquivo volta letra por letra | `viewport/tools/select.ts` (`SetProperty`, `clearBone`) |
| H3 | **A seta empurra a imagem que acabou de entrar.** Duas causas: o foco ficava na aba Imagens (soltar na cena agora dá o foco à cena), e a imagem nasce escolhida como slot, sem o anexo (um slot escolhido sozinho agora vale pelo desenho que mostra) | `viewport/viewport.ts` (`onDrop`), `viewport/tools/drawing-group.ts` |

**Testes:** 197 verdes nos três da parte (`viewport`, `cena-selecao`, `ferramentas`) às 06:07; `tsc` limpo às 06:07. Cada defeito tem um teste que ficou vermelho antes do conserto (F1: a forma, no documento de verdade; A4 e H3: vermelhos medidos).

**Fotos** em `backup/fotos-rodada-final/cena/`: `lote-3_F1-depois_caixa-sem-alt-diz-o-gesto.png`, `lote-3_F2-depois_girar-a-canela-diz-girar-osso.png`, `lote-3_F3-depois_girar-a-cabeca-diz-quem-segura.png` (com o texto antes de encurtar). Os "antes" são as fotos do lote 2 (`lote-2_passo-17`, `passo-03`, `passo-04`, `passo-07`). **Sem foto: o H3 depois, e o F3 com o texto curto — o computador travou às 05:57.**

### v23.2 — Ver, esconder e vestir: a porta que não morre e o desfazer que leva a pilha — 29/09/2026

Pelo `EXECUTANDO · exibição, peles e histórico` (chat I da rodada final), lote 3,
gravado entre 05:01 e 05:24. Defeitos I1–I7 (fila do lote 2), M1 e M11 (chat M);
decisões P23, P42. Referência e fila com as quatro perguntas:
`documentos/pesquisa/nova pesquisa/SEQUENCIA exibicao peles e historico 2026-09-28.md`.

🗣️ *"No programa, eu sinto que não tem panela, que não tem arroz."*

| O quê | Antes | Depois |
|:---|:---|:---|
| **I3 — a porta que não morre** (P23) | as 26 ações de ver, travar e cebola nasciam no `mount()` da aba Exibição. **Fechada a aba, o botão "Ver ossos" do alto e o menu Exibir inteiro ficavam sem ação, calados** (medido na fila do lote 2). `importar-pele` tinha o mesmo defeito, na aba Peles | as 27 nascem no arranque, em `panels/view-panel-actions.ts` (novo). A aba só desenha as caixas. Tabela: `exibicao` e `importar-pele` de `painel` para `arranque`; conta do `acoes.test` pela soma (+27, P42) |
| **I2 — "só este" sem nada escolhido** | `Shift+H` com a seleção vazia **escondia TUDO** e dizia *"Só o escolhido"* (regra 21). E a seleção esvazia sozinha depois de um `H` | `Shift+H`, `H`, `Ctrl+2` e `Ctrl+Shift+2` sem escolha recusam: *"Nada escolhido. Escolha uma peça na cena ou na Árvore, e aperte de novo"* |
| **I1 — a conta** | *"2 escondido"* para **um** desenho (contava o slot e o anexo) | *"1 peça escondida. Ctrl+Alt+3 mostra tudo"*; plural certo |
| **Limpar guias** (P58, 09:42) | levada ao arranque, ficava **cinza** sem guia nenhuma — um cinza sem motivo escrito, que o vigia `existir-nao-e-funcionar` acusou | sempre responde. Sem guia: *"Não há guias para limpar. Arraste a partir de uma régua para criar uma"*. Com guias: apaga todas e diz *"2 guias apagadas"* (ou *"1 guia apagada"*). Esconder, só este, travar, mostrar tudo, destravar e ver só o resultado ganharam teste com o estado montado: passavam no vigia pela recusa, de carona |
| Os quatro botões do alto (os do Spriter) | mudavam de cor e o rodapé calava | o rodapé diz o que a cor quer dizer e a tecla da volta: *"Ossos escondidos. 7 traz de volta"* |
| **I5 + M1 — o desfazer leva a pilha** | a pele mora no arquivo; a pilha e o lápis, no documento. `Ctrl+Z` numa "Nova pele" deixava o lápis e a pilha numa pele que não existia mais; **renomear** acendia *"a pele "pele" está ligada e este corpo não a tem"* com o **nome velho** (M1). Os dois avisos nasciam do próprio gesto | `KeepSkinStack` (`panels/skins-actions.ts`): a pilha e o lápis de depois são uma **conta pura** a partir dos de antes, gravada **dentro** do comando, antes do rebuild. Vale para Nova, Duplicar, Apagar, Renomear e Pele de pasta. O `Ctrl+Z` devolve os de antes; o `Ctrl+Y`, os de depois |
| **M11 — Importar pele… calava** | o seletor abria sem dizer para quê e fechava sem dizer o que houve | fala antes (*"Escolha o arquivo da pele. Ela entra com os ossos dela"*) e depois: qual pele entrou, *"Nenhum arquivo escolhido. Nada mudou"*, ou *"Importar pele parou: <motivo>"*. Botão da aba e menu chamam a mesma `importSkinFromDisk`. Saiu da lista de exceção `ESPERAM_JANELA`: agora ela diz, e a lista não cresce |
| **I7 — o passo seguinte** | depois de "Nova pele", nada dizia como pôr um desenho nela | o rodapé e uma frase na aba (enquanto a pele do lápis está vazia) dizem o gesto. **Frase provisória:** "arraste uma imagem da aba Imagens para a cena". A final espera o P27 do chat H (trocar a imagem grava na pele do lápis) |
| **I6 — os nomes das peles** | na coluna de 260 px, Ativas mostrava "p." e "d"; Feitas, duas "armad…" iguais | em aba estreita (`@container`, até 400 px) as duas listas ficam uma embaixo da outra; alargando a coluna, voltam lado a lado |
| **I4 — a cebola que se vê** | ligada, só um risco fino de osso por trás do boneco; ampliando, via-se nos pés | o fantasma desenha as **imagens**, tingidas com a cor do lado (o "Images" do Ghosting do Spine), numa folha à parte, e os riscos por cima. O escondido um a um não aparece no fantasma |

**Medido** às 05:24–05:27: `exibicao`, `peles`, `acoes` e `menus` — 353 verdes,
3 pulados (os do manual), 2 vermelhos **de outro dono** (`KeyDriverTarget`, chat C);
`tsc` sem erro nos arquivos deste lote. Cada conserto tem teste que **prova antes**
que o defeito existia (regra 26): o renomear pelo caminho velho deixa o aviso; a
conta "só este" sem escolha esconde tudo; o importar de antes, cancelado, não diz nada.

**Sem foto: o computador travou às 05:57; a foto entra no turno seguinte.** As
fotos de "antes" existem — são as da fila do lote 2 (`backup/fotos-rodada-final/exibicao-e-peles/lote-2*/`).
Faltam as de "depois" de I3/I2/I1, de I5/M1/I6/I7 e da cebola (I4). **I4, I6 e I7
não foram vistos no navegador**: estão provados por teste sem tela (I7) ou por
nenhum teste (o desenho do I4 e o CSS do I6). Até a foto, são promessa.

**As formas de erro deste lote** (regra 27):
- *Chamei `repose()` de dentro do comando, antes do rebuild.* O esqueleto ainda não
  conhecia a pele nova, e dois testes da casca caíram por 4 minutos (05:01–05:05).
  A pilha virou conta pura; o rebuild a aplica.
- *Escrevi num comentário a forma da chamada que o vigia procura* (`registerAction('…'`).
  O vigia lê texto, e contou um id `'id'` que não existia.
- *Gravei com Python em modo texto, no Windows*, e dois arquivos LF viraram CRLF:
  o diff mostrou o arquivo inteiro mudado. Achado no diff, desfeito antes de medir.

### v23.2 — As partículas que se acham — 29/09/2026

Pelo `EXECUTANDO · partículas que se acham` (chat B da rodada final), lote 1,
às 05:36. Ficha B, decisões P5, P7, P10, P38; defeitos B1, J12, L1b. Referência:
`documentos/pesquisa/nova pesquisa/REFERENCIA particulas 2026-09-28.md`.

🗣️ *"Partícula. Eu não sei onde é que acha partícula nesse programa."*

| O quê | Antes | Depois |
|:---|:---|:---|
| **A porta** | `Esqueleto → Novo → Emissor de partículas` e o `Novo ▾` da Árvore, no meio de outras linhas | botão **"Partículas"** no fim da barra da cena, com a palavra sempre à vista. Menu: Emissor vazio · Fogo · Fumaça · Faísca · Poeira |
| **Os modelos prontos** | não havia; o emissor novo nascia **sem imagem** e não desenhava nada | quatro modelos, só com campos da §9 da extensão, e a imagem **`fx/ponto-suave`** (um ponto branco suave pintado pelo programa) entrando junto no acervo — um passo de desfazer. Salvar grava o atlas; reabrir traz de volta (provado com foto) |
| **Os ids** (P5) | — | `particulas-fogo`, `-fumaca`, `-faisca`, `-poeira`, também em Animação → Efeitos de chave ▸. Tabela 218 → 222 |
| **B1 — a cor da partícula** | o desenhador do runtime usava **só o alfa** da partícula; o comentário dizia que usava a cor. Um fogo laranja saía branco na cena, na Prévia e no exportar imagem | `light = slot × anexo × partícula` (§9.7), e depois a §7.12 pelo **mesmo `applyTint`** do desenho comum. Partícula branca continua direta, sem rascunho |
| **J12, L1b — o nome à vista** (P38) | os 26 botões tinham dica, e nenhum nome à vista | a **ferramenta escolhida** mostra a palavra ao lado do ícone; Desfazer e Refazer cinza mantêm `(Ctrl+Z)` e `(Ctrl+Y)` na dica |

**A barra, medida** (conteúdo − largura): 1440×900 só ícones 0, com as duas
palavras **+145 px**; 1280×720 só ícones +150, com as palavras +305. O "Mais ▾"
do chat P recolhe o resto. Se ele não entrar na versão, a chave
`WORDS_ON_BAR` (`panels/particle-presets.ts`) desliga as duas palavras numa linha.

**As formas de erro deste lote** (regra 27):
- *Importei um módulo com efeito colateral num teste e mudei a ordem de registro.*
  `cena.test.ts` importando `viewport-toolbar.ts` puxava `viewport.ts` inteiro, e
  "escolher vem antes de criar" caiu. A regra da palavra foi para um módulo puro.
- *Um comentário que descreve o que o código devia fazer, e não o que faz* — o B1.
- *Ia pintar a cor na imagem* para contornar o B1; o Planejador recusou: a ficha
  mudaria a cor e a tela não. O remendo esconde o defeito do próximo.

### v23.2 — A animação que nasce à vista — 29/09/2026

Pelo `EXECUTANDO · animações, prévia e curvas` (chat G da rodada final), lote 3,
às 05:25. Defeitos Q1 + K1, Q2 + K14, K2, Q3, e a decisão P33. Referência:
`documentos/pesquisa/nova pesquisa/SEQUENCIA animacoes previa e curvas 2026-09-28.md`.

🗣️ *"Criei a animação e ela está ali, com o nome para eu escrever."*

| Defeito | Antes (medido, 1440×900) | Depois (medido) |
|:---|:---|:---|
| **Q1 + K1** a lista de animações | **17 px** de lista: os seis ícones em duas linhas comiam 112 dos 129 px. A nova nascia fora da vista; o mouse não alcançava linha nenhuma | **68 px**, duas linhas inteiras. Os ícones foram para a tira do título "Animações" |
| **Q1 + K1** a animação nova | aparecia só no rodapé | aparece à vista, escolhida, **com o campo de nome aberto** |
| **P33** voltar a montar | a linha do corpo dizia "heroi 3", e ficava acesa sempre | **"Base — montar"**, uma linha só com um corpo; acende só quando a base está aberta |
| **Q2 + K14** renomear | duplo clique: nada. O lápis abria o `prompt` do navegador | duplo clique, lápis e botão direito abrem o campo **na própria linha**. Enter grava, Esc desiste |
| **K2** o aviso do renomear | *"Abriu a animação 'andar'"* | *"Renomeou a animação 'animação' para 'andar'"* |
| **Q3** botão direito no nome | nada | menu: Renomear · Duplicar · Mandar para o topo · Exportar animação… · Apagar. O cinza diz por quê |
| (onde mais) Salvar como base nova | `prompt` do navegador | a janela da casa (`askForm`) |

| Onde | O quê |
|:---|:---|
| `panels/animations-model.ts` | `bornAnimation`, `renameWhenOpen`, `showBodiesList`, `baseLineLabel`, `renameAnswer`, `renamedNotice`, `animationRowMenu` — puros |
| `panels/animations.ts` | ícones na tira · linha "Base — montar" · campo de nome no lugar · botão direito · abrir só troca o realce (o duplo clique renomeava a vizinha) |
| `panels/animations.css` | a lista pega a altura que sobra; ícones de 26 px |
| `editor/testes/animando.test.ts` | `describe` "a fila do arroz — criar, achar e renomear" — 7 casos. **Vistos falhar antes** (05:01, 5 vermelhos) |

Fotos: `backup/fotos-rodada-final/animacoes/` — antes `lote-2_03`, `lote-2_04`,
`lote-2_06`, `lote-2_07`; depois `lote-3-q1_01` a `_06` e o mosaico `_00`.

**Conserto de 09:51 — o roteiro, passo 14.** O chat C achou (09:43 e 09:44): depois
de *"Fecha, reabre a pasta"*, a lista tinha **zero** `.anim-item`. A linha estava lá
como **campo de nome**: reabrir levava a lista de `[]` a `['animação']`, com ela
aberta, e este lote contava isso como *"nasceu"*. **A forma do erro (regra 27):**
*tomei "a lista cresceu" por "alguém criou".* Agora só a **Nova animação** pede o
nome (`takeNameRequest`), e trocar o arquivo nunca abre o campo (`renameAfter`).
Desfazer um Apagar e importar também fazem a lista crescer, e também não abrem.
Teste visto falhar antes (09:51, 3 vermelhos). Medido um de cada vez, sem servidor:
`animando.test.ts` 104 de 104 (09:51, 1 001 MB livres) · `acoes.test.ts` 24 de 24
(09:51, 1 120 MB) · `tsc` limpo (09:51, 1 220 MB). O roteiro fica para o chat C.

### v23.2 — O "Mais ▾": a barra não rola de lado — 29/09/2026

Pelo `EXECUTANDO · a tela que cabe` (chat P), lote 3a, decisão P48. Defeitos L16 e I-O3.

🗣️ *"Nada rola de lado."*

| Medida | Antes | Depois |
|:---|:---|:---|
| 1280×720, `programa/` v23.1 | a barra rola 150 px; "Travar desenhos" cortado ("Trav") | estouro **0** |
| 1440×900, com a palavra da ferramenta (P38, chat B) | rolaria 145 px (medido pelo chat B) | estouro **0** |
| 1280×720, com a palavra | rolaria 305 px (medido pelo chat B) | estouro **0** |

| O quê | Como |
|:---|:---|
| O que não cabe | sai da barra e entra no **Mais ▾**, no fim, na ordem da barra. A linha do menu aperta o próprio botão: mesma ação, mesma dica, mesmo cinza. O interruptor ligado vem com ✓ |
| Quem sai primeiro | Recortar, Copiar, Colar, Apagar e Imagem de referência: têm tecla e moram no menu Editar. **Ver/Travar ossos e desenhos saem por último**: foram o pedido do Humberto com a tela do Spriter aberta |
| Quem nunca sai | a ferramenta escolhida, os Eixos e **Partículas** |
| Onde | a conta pura `fitBar` em `ui/action-bar-model.ts`; o desenho em `viewport/viewport-toolbar.ts` (`fitMore`, só este trecho, P48); `viewport.css`: a barra com `overflow-x: hidden` |
| Testes | 5 novos em `colunas-e-barra` |

**O que ficou no "Mais ▾" hoje:** em 1440×900, os cinco ícones de editar e "Travar desenhos"; em 1280×720, os cinco e mais "Ver desenhos". Fotos: `backup/fotos-rodada-final/tela/lote3/`.

### v23.2 — A tela que não pula — 29/09/2026

Pelo `EXECUTANDO · a tela que cabe` (chat P da rodada final), lote 2, às 05:20.
Defeitos J4 + F5, L14, K13 e F4. Referência:
`documentos/pesquisa/nova pesquisa/REFERENCIA a tela que cabe 2026-09-29.md`.

🗣️ *"Nada pula, nada encolhe sozinho, nada rola de lado."*

| Defeito | Antes (medido) | Depois (medido) |
|:---|:---|:---|
| **J4 + F5** Criar osso na mão | a tela alargava para 1.551 px; a coluna da direita saía 111 px para fora | a tela fica em 1.440 px; a frase corta com "…" |
| **L14** frase longa no rodapé | o rodapé ia de 54 para 78 px, e a cena subia 24 px | o rodapé fica em 54 px, sempre |
| **K13** abrir Detalhes | a cena caía para 368 px (1440×900) e 250 px (1280×720) | 441 px e 342 px: a cena nunca fica menor que 55%; a faixa de baixo cede e rola por dentro |
| **F4** Caixa e Ponto na mão | rodapé calado; arrastar sem Alt não fazia nada | o rodapé diz o gesto: *"segure Alt e arraste"* |

| Onde | O quê |
|:---|:---|
| `ui/shell.css` | `.shell` com `minmax(0, 1fr)`; `.status-bar` com altura fixa, uma linha, reticências; `.shell-middle` com `min-height: 55%`; `.dock` encolhe |
| `ui/toolbar-model.ts` | `BOX_FOOTER` e `POINT_FOOTER` em `toolFooter` |
| `editor/testes/colunas-e-barra.test.ts` | 4 testes novos; os 5 pontos de CSS dariam vermelho no código de antes (conferido na cópia do `backup/`) |

**A troca, dita como troca:** em 1280×720 com Detalhes aberto, a faixa de baixo fica com 226 px. Ela mostra o tocador, os botões, a régua e o Resumo; **as linhas por osso só aparecem rolando** a faixa.
**A dica: inteiro**, medido às 05:55. A casca pôs o `title` com a frase inteira em `.status-tool` e `.status-state` (`ui/shell-status.ts`, 05:23); a frase cortada com "…" se lê inteira passando o mouse.
Fotos: `backup/fotos-rodada-final/tela/lote2/`, antes e depois, nas duas medidas.

### v23.2 — Os menus na ordem do trabalho — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2 da rodada final), gravado às 05:00.
Decisões P33, P41 e P47 do `PLANEJADOR · 9f75b5`. A lista, item por item:
`documentos/planos/A ORDEM DOS MENUS 2026-09-29.md`.

🗣️ *"Tem muita coisa que não aparece no menu."*

| Antes | Depois |
|:---|:---|
| Arquivo · Editar · **Exibir** · Esqueleto · Animação | Arquivo · Editar · Esqueleto · Animação · **Exibir**: olhar vem depois de fazer |
| Exportar em quatro menus (Arquivo, o bloco Salvar, Esqueleto, Animação) | **Arquivo → Exportar ▸**, um lugar só: em cima o que vai para o jogo, embaixo o que vai para outro boneco |
| "Imagem…", "Por pele…", "glTF…" | **"GIF, PNG, folha, vídeo…"**, "Uma imagem por pele…", "glTF, para programa 3D…": o nome diz o que sai |
| Importar pele e Importar animação em Esqueleto e em Animação | **Arquivo → Importar ▸**, bloco "de outro boneco", espelhando o Exportar |
| Arquivo: abrir → salvar → importar | abrir → **a pasta** → **importar** → salvar → exportar |
| Esqueleto: peles e física antes da hierarquia e da ordem | Novo → Virar filho → a ordem de desenho e as pastas → Física → **Peles ▸** → repouso |
| "Imagem no slot…" | **"Pôr imagem na cena…"** |
| Travar em Esqueleto, Ver em Exibir | **Exibir → Travar ▸**, junto do Ver |
| Variável, Etiqueta e Evento em Esqueleto → Novo | em **Animação**, ao lado das Marcas |
| "Efeitos" (quem procurava fogo achava flash) | **"Efeitos de chave"**, e a dica diz onde mora a partícula |
| Copiar a pose do escolhido e Colar espelhado em Animação | em **Editar**, com todo copiar e colar |
| Janela: montar · animar · olhar misturados | montar = Imagens · Entidades · Pivôs · Árvore · Ordem · Malha e pesos; animar = Animações · Linha do tempo · Curvas · Peles · Regras; olhar = Propriedades · Exibição · Prévia · Histórico |

**Nenhum id mudou. Nenhuma tecla mudou.** O nome velho de cada item que mudou
de lugar ou de nome está na dica, e a Paleta de comandos acha pelos dois.
Doze testes que diziam ONDE um item mora foram reescritos, só nessa parte; a
tabela está nos Desvios do encargo.

**Fotos:** antes em `backup/fotos-rodada-final/defeitos/menus_antes.png` (o
`programa/` montado na v23.1). Depois, na v23.2, um por menu:
`backup/fotos-rodada-final/defeitos/menu-Arquivo_depois.png` (com o Exportar ▸ aberto), `menu-Editar`,
`menu-Esqueleto`, `menu-Animacao` (com o No fim ▸ aberto), `menu-Exibir`,
`menu-Janela`, `menu-Ajuda`, todas `_depois.png`.

### v23.2 — O rascunho de um trabalho não é trocado por um vazio (A3, J13) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 05:07. Decisão P17.

**Antes:** herói mexido → recarregar → "Agora não — guardar o rascunho" →
trocar de ferramenta: o rascunho do herói **sumia**. Recarregar de novo, e a
janela oferecia *"sem nome"*, 749 letras. E salvar → recarregar oferecia
recuperar um arquivo que já estava salvo (J13). Duas formas: *o ouvinte
tratava "limpo" como "acabei de salvar"* e *a saída gravava o rascunho mesmo
limpo*.

**Depois:** só o **salvar** apaga o rascunho (`SAVED_LABEL`, `draftMove` em
`doc/rascunho.ts`), e fechar a aba com o documento limpo não grava nada
(`draftOnExit`). Em `ui/shell-drop.ts`, só a função `armUnloadGuard`.

**Prova:** o teste novo em `documento.test.ts` FALHA em 3 de 4 no código de
antes (regra 26); com o conserto, o arquivo inteiro passa.

**O que fica:** o rascunho é **um só** — quem escolhe "Agora não" e depois
mexe grava por cima do guardado. Está na lista de defeitos como A2-1.

**Foto:** `backup/fotos-rodada-final/defeitos/a3_depois.png` — herói mexido → recarregar → "Agora não" →
trocar de ferramenta → recarregar: a janela oferece **heroi.bone**. Sem foto de
antes: o antes está medido em números (29/09, 00:20), e o montado de antes já
não existe.

### v23.2 — O rodapé fala por um lugar só, com um ponto só (P44, L13) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 05:23. Arquivo novo
`ui/shell-status.ts`.

**Antes:** o rodapé terminava com dois pontos — *"Ligou a ferramenta Malha
(M), para mexer na cena.."* (L13, K11 e o do chat F). A forma: *a casca punha
o ponto sem olhar se a frase já tinha*. E a frase cortada com "…" pelo chat P
não tinha como ser lida inteira: o `title` estava vazio.

**Depois:** toda escrita no rodapé passa por um setter só
(`falarPorUmLugar`), que grava a frase e o `title`. As 74 escritas que já
existiam em cinco arquivos passam por ele sem mudar uma linha. O ponto entre
duas frases entra só se faltar (`juntarFrases`). Para quem escreve daqui em
diante: `shell.dizer(texto)`.

**Foto:** `backup/fotos-rodada-final/defeitos/heroi_rodape_depois.png` — o rodapé diz *"Modo de ligar ossos
fechado. Arquivo salvo."*, um ponto só, e o `title` tem a frase inteira.

### v23.2 — O desfazer devolve a chave no MESMO lugar do arquivo (P11, E1) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 05:30. Achado pelo chat E.

**Antes:** PSD substituir → `Ctrl+Z`: o boneco voltava, o `.bone` não —
a chave apagada voltava para o FIM do arquivo. A forma: *o desfazer devolvia
o valor e não o lugar* (`SnapshotCommand.revert`, `file[nome] = valor`).

**Depois:** o `SnapshotCommand` guarda a ordem das chaves ao aplicar, e o
desfazer a repõe no mesmo objeto (`restoreKeyOrder`, `doc/commands.ts`).

**Prova:** dois testes novos em `documento.test.ts`, que falhavam antes; o E1
do chat E ficou verde. `documento`, `arquivo`, `peles`, `arvore`, `chaves` e
`regras`: 875 verdes, nenhum teste de outro dono tocado.

Sem foto: não há o que ver na tela — a diferença está no texto do arquivo, e o
teste a mostra.

### v23.2 — A janela de formulário sem aviso não mostra barra vazia (A1) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 05:32.

**Antes:** aba Ordem → duplo clique no nome de uma pasta: a janela "Renomear
a pasta" mostrava uma barra marrom **vazia**, o lugar de um aviso que não
existia. **Depois:** vazia, ela não aparece (`.dialog-form-previa:empty` em
`ui/dialog.css`, o mesmo gesto da `.dialog-teclas-aviso:empty`).

**Fotos:** antes, `backup/fotos-rodada-final/defeitos/lote-1_pasta_antes-janela.jpg` (do chat A, 28/09: a
barra vazia); depois, `backup/fotos-rodada-final/defeitos/a1_depois.png` (a mesma janela, sem a barra). A foto
de antes tirada às 05:42 mostra a janela errada ("Pôr numa pasta", que tem aviso escrito) e foi para
`backup/fotos-rodada-final/defeitos/descartadas/`.

### v23.2 — O teste da compensação diz o que prova (A5) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 05:36. Regra 28.

`eixos-e-chaves.test.ts` tinha *"a compensação é um passo de desfazer que
volta a pose inteira"*: mexia o pai por fora de comando e conferia só o filho.
Agora se chama *"desfazer a compensação devolve o FILHO num passo só; o pai,
mexido fora de comando, fica"*, e confere as três coisas: um comando na pilha,
o filho de volta, o pai onde o teste o deixou. O "um arrasto = um `Ctrl+Z`"
de verdade está em `inclinar.test.ts` e `documento.test.ts` (o
`GestureGroup`, 28/09). Só esse teste mudou; nenhum foi apagado.

### v23.2 — O herói abre com o nome heroi.bone (A2, N-12) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 05:39. Decisão P25.

**Antes:** no programa montado, o herói abria como **`heroi-DUlefYnW.bone`**:
o título da janela e o nome de toda exportação (`heroi-DUlefYnW.gif`…). O
nome vinha do endereço que o empacotador carimba. **Depois:** o nome é o do
arquivo (`EXAMPLE_NAME`, em `main.ts`). Procurado onde mais: a biblioteca de
animações lê o texto pelo nome do arquivo, e a espada pelo `uri` do próprio
`.bone` — só o herói tinha o carimbo.

**Fotos:** antes, `backup/fotos-rodada-final/defeitos/lote-1_pasta_antes-janela.jpg` (no canto de cima,
`heroi-DUlefYnW.bone`); depois, `backup/fotos-rodada-final/defeitos/a1_depois.png` e `heroi_rodape_depois.png`
(`heroi.bone`).


### v23.2 — "No fim ▸" no menu Animação (a4) — 29/09/2026

Pelo `EXECUTANDO · a casca` (chat A2), gravado às 09:38. Os cinco modos são
do chat D (`anim/transport.ts`, `END_MODES`); o menu é da casca.

**Antes:** o que o tocador faz ao chegar no fim morava só no ⋯ Mais da linha
do tempo. As cinco ações existiam, sem item de menu e com o nome vazio na
tabela. **Depois:** Animação → **No fim ▸**, logo depois de Repetir: Como o
arquivo diz · Parar no fim · Repetir · Vai e volta · Voltar ao início, com a
marca de rádio no que vale. Os nomes são os do tocador, um nome só nos dois
lugares (o teste confere).

A conta da tabela subiu de 226 para 232 numa volta só: +1 do pai `no-fim`
(casca) e +5 dos `fim-*` (chat D), combinado entre os dois.

**Foto:** `backup/fotos-rodada-final/defeitos/menu-Animacao_depois.png`, com o No fim ▸ aberto.

### v23.2 — As etiquetas do Aseprite viram animação — 29/09/2026

Pelo `EXECUTANDO · arquivo e importar` (chat E da rodada final), Ficha E,
lote 2, escrito às 05:02. O número da versão sai na janela de fecho 2 (decisão P51). Decisão D3: *"uma por etiqueta, com aviso no rodapé"*.

**Antes:** soltar `boneco.png` + `boneco.json` trazia o desenho de 8 quadros,
e as etiquetas `andar`, `pular` e `parado` eram lidas e jogadas fora. O
rodapé até dizia *"com 3 etiquetas"* — e a aba Animações seguia vazia.

**Agora:** o mesmo gesto, sem botão novo. Cada etiqueta vira uma animação,
e o rodapé diz *"3 etiquetas viraram animação (andar, pular, parado)"*.

| Aseprite | Recorte |
|:---|:---|
| etiqueta | uma animação de mesmo nome (repetido ganha `2`) |
| cada quadro do trecho | uma chave `sequence`, `hold`, com o índice dele |
| `duration` de cada quadro | o tempo da chave seguinte, somado em ms inteiros |
| `forward`, `reverse`, `pingpong`, `pingpong_reverse` | a ordem dos quadros; no vai-e-volta a ponta não se repete |
| sem `repeat` | `loop: true` |
| `repeat: "N"` | a volta escrita N vezes, `loop: false`; no vai-e-volta cada SENTIDO conta uma |
| etiqueta fora da folha, ao contrário, sem nome, direção estranha | não vira nada, e o rodapé diz qual e por quê |

**Uma chave por quadro, e não uma chave só** (o que o degrau 6 escolheu para
a boca): o modo `loop` anda pela sequência INTEIRA, e a etiqueta é um trecho
dela; e o Aseprite deixa cada quadro com a sua duração. É o modelo do Spriter
— uma chave a cada troca de imagem.

**O desenho e as animações são UM passo de desfazer.** Um `Ctrl+Z` tira tudo.

Referência, com os links: `documentos/pesquisa/nova pesquisa/REFERENCIA arquivo e importar 2026-09-28.md`
(as direções vêm de `src/doc/anidir.cpp` do Aseprite; a conta do vai-e-volta, de `src/doc/playback.cpp`).

| Arquivo | O quê |
|:---|:---|
| `editor/src/io/aseprite-sheet.ts` | a etiqueta guarda `direction` e `repeat` (o `repeat` vem entre aspas) |
| `editor/src/io/aseprite-tags.ts` | **novo**: `tagFrameOrder`, `tagAnimations`, `AddSheetAnimations`, `SheetDropCommand` |
| `editor/src/ui/shell-drop.ts` | o arrasto da folha usa os dois |
| `editor/testes/folha-animada.test.ts` | 26 → 53 casos |

Fotos: `backup/fotos-rodada-final/arquivo/lote-2_antes.png`, `lote-2_depois.png`, `lote-2_depois-pular.png`.


### v23.2 — Lote 2b do chat D: o uso — achar, ver e ouvir o que se fez — 29/09/2026

Pelo `EXECUTANDO · árvore, malha e linha do tempo` (chat D da rodada final).
**Sem número próprio** (decisão P51). **Pela metade**: o computador travou por
falta de memória às 05:57, e o resto espera o turno do chat D.

| # | O defeito | O que mudou |
|:---:|:---|:---|
| K5 | colar a pose espelhada não se achava, e o herói não casava com o padrão (`_e/_d, _l/_r, _esq/_dir`) | o padrão ganha `_front/_back` e `/_b`; o colar só troca para o par que EXISTE no arquivo, e o rodapé diz o que trocou, quem ficou sem par e o que procurou. O item ao lado de Colar, em Editar, é da casca |
| K11 | escolher uma malha ligava a ferramenta Malha sozinha — até com a aba escondida | só o **Virar malha** liga a Malha (decisão P21); o rodapé diz *"virou malha: 4 vértices. A ferramenta Malha (M) ligou"* |
| J3 | `Esqueleto → Novo → Osso` nascia de comprimento zero, solto na origem | nasce com 40 de comprimento, filho do escolhido e **na ponta dele**, escolhido, e o rodapé diz onde |
| B2, F7 | a Árvore não rolava até o que foi escolhido fora dela (o emissor novo, o osso clicado na cena) | quando a escolha muda, a Árvore abre o caminho até a linha e rola até ela |
| I-O1 | o olho da Árvore escondia calado | *"O desenho "hair" está escondido: não aparece e não pega clique"* |
| I-O4 | as opções da casca de cebola abriam cortadas | a lista sai presa à janela, para o lado que tem espaço (`popupPlacement`) |
| a4 | o "No fim" do tocador só existia no ⋯ Mais | cinco ids de arranque: `fim-arquivo`, `fim-parar`, `fim-repetir`, `fim-vai-e-volta`, `fim-voltar`. O submenu é da casca |

**Falta, no turno do chat D:** buscar e renomear com a Árvore fechada · soltar
imagem na Árvore grava na pele do lápis (P27) · as fotos do 2a e do 2b.

Testes novos em `arvore`, `malha`, `linha-do-tempo`.

### v23.2 — Lote 2a do chat D: as chaves que nascem caladas ou no lugar errado — 29/09/2026

Pelo `EXECUTANDO · árvore, malha e linha do tempo` (chat D da rodada final).
**Sem número próprio** (decisão P51): entra na versão única da janela de fecho 2.

| # | O defeito | O que mudou |
|:---:|:---|:---|
| K15 | a troca de animação de uma **entidade** gravada em 0,50 s valia desde 0 (9.10: antes da primeira chave vale a primeira) | a primeira troca grava junto o que valia antes, em 0, no mesmo passo (`entityStartValue`: anexo, herança pelo nome, ou nada; sem o filho aberto não inventa) |
| K15, onde mais | o **tremor** sorteava a primeira chave: numa linha nova, o osso ficava fora do lugar desde o começo | a primeira chave do tremor é o valor de agora; ele começa parado. Vermelho visto antes: 12,78 em 0,00 s, com a montagem em 10 |
| P12, K12 | a chave que a cena não mostra (virada, troca de imagem, ordem, etiqueta) era só um losango no Resumo | `revealKey(ref)` em `anim/keying.ts`: abre os Detalhes, escolhe a chave e rola até ela. Gancho, não ação de menu. A sequência e a entidade já chamam; os outros donos chamam com uma linha |
| G1 | o botão direito no losango do **Resumo** não abria nada; o das linhas só tinha as curvas | o mesmo menu nos dois, com **"Apagar chave"** à vista |
| P9 | a virada de corpo só saía pelo `removeKey` genérico; o `removeBodyKey` não tinha chamador | `removeKeyRef`: `Delete`, duplo clique e botão direito tiram a virada pelo dono dela. No losango da virada o menu diz "Tirar a virada de corpo", sem curvas. Rodapé: *"Tirada a virada para lobisomem, em 0,50 s"*. Saiu do vigia do comando sem porta |
| K3, L17 | posar e arrastar vértice criavam chave **sem dizer**; o laranja da caixa do tempo não tinha dica | a linha do tempo olha as chaves antes e depois: *"Chave em 0,00 s: Rotação de leg_b"*, *"Chave em 0,53 s: Deformação da malha de head"*. A caixa laranja diz *"há chave neste tempo"* |
| L17 | a Malha calava quando o clique não pegava vértice | *"Nenhum vértice aqui. Clique num quadrado branco e arraste; Ctrl+clique cria um vértice"*, uma vez por malha |

Testes novos em `chaves`, `linha-do-tempo`, `efeitos` e `malha`.

### v23.1 — Evento e Parâmetro ganham linha na Árvore — 29/09/2026

Pelo `EXECUTANDO · árvore, malha e linha do tempo` (chat D da rodada final), lote 1.

Evento e Parâmetro nasciam pelo `Novo ▾` da Árvore e **não viravam linha
nenhuma** (auditoria de 27/09, bloco 1). Nem os dois eventos e o parâmetro que
o herói já trazia apareciam.

| O que mudou | Como |
|:---|:---|
| Um grupo **"Eventos e parâmetros"** no fim da Árvore | o nó `Events` do Spine: fora da hierarquia dos ossos, embaixo. Dobra como um osso; a busca abre até o achado. Não aparece num arquivo sem evento e sem parâmetro |
| Clicar no parâmetro | abre a ficha dele em Propriedades |
| Clicar no evento | escolhe o evento no editor de evento (a seleção fica vazia: o contrato não tem seleção de evento) |
| Botão direito | parâmetro: ficha, aba Regras, apagar (com as chaves). Evento: ficha. Grupo: novo evento, novo parâmetro |
| Criar pelo `Novo ▾` | o novo **nasce escolhido**, o grupo abre, a linha rola até a vista, e o rodapé diz *"criado, no fim da Árvore"* (a régua do arroz) |
| Ícone novo `event` | o raio. O parâmetro usa o mesmo ícone da aba Regras |
| **Conserto achado no caminho** | `AddEvent`, `AddParameter`, `AddConstraint` e `AddSkin` deixavam `"lista": []` no desfazer, num arquivo que não tinha a lista. A forma: *criei a lista e não cuidei dela no desfazer*. O teste ficou vermelho antes do conserto |

Referência: `documentos/pesquisa/nova pesquisa/REFERENCIA arvore malha e linha do tempo 2026-09-28.md`.
Fotos: `backup/fotos-rodada-final/arvore-malha-tempo/lote-1_antes.png` e `lote-1_depois.png`.
Testes: 14 novos em `arvore.test.ts`.

### v23.2 — Chat C, lote 3: gravar a chave do alvo no valor de agora — 29/09/2026

Pelo `EXECUTANDO · as portas das regras` (chat C). **Número: na janela de fecho.**

`KeyDriverTarget` existia desde o degrau 12, e nenhum botão o chamava.

| O quê | Onde | Modelo |
|:---|:---|:---|
| **Gravar a chave aqui** | a chave na linha do parâmetro, na aba Regras. A janela mostra cada alvo que lê o parâmetro, com o valor que ele dá **agora** já escrito; muda-se o número e grava | o [+] do Live2D ([Add/Delete Keys to/from parameters](https://docs.live2d.com/en/cubism-editor-manual/edit-parameters/)) |
| O valor de agora sai da **conta do runtime**, com as curvas | `driverKeyPlans`, `rules-model.ts` | — |
| O ícone `key` passou a existir | `ui/icons.ts` | — |

**Por que o número vem escrito, e não da pose do osso:** com a base aberta,
posar o osso mexe no setup, e o Comando soma por cima dele. A pose viraria
chave errada, calada.

**Defeito achado no caminho:** o botão "Assar a física em chaves" pedia o ícone
`key` desde o degrau 12, e o ícone **não existia** — o botão desenhava a letra
"A" no lugar. Forma: *usei um nome de ícone que ninguém tinha desenhado, e o
desenho de reserva escondeu a falta.*

**Sem foto de depois: o computador travou às 05:57** (memória), e o turno
seguinte não pode abrir servidor. Foto de antes em
`backup/fotos-rodada-final/regras/lote-3_antes.png`; a de depois vem na volta.

`regras.test.ts`: 99 → 104.

### v23.2 — Chat C, lote 2: trocar os ossos de uma regra, a chave de etiqueta se mostra, e as provas que guardam a queda — 29/09/2026

Pelo `EXECUTANDO · as portas das regras` (chat C). **Número da versão: na janela
de fecho das 06:30, pelo fechador.**

| O quê | Onde | Modelo |
|:---|:---|:---|
| **Trocar os ossos** de uma regra já feita (`SetRuleChain`, sem porta desde o degrau 12) | o lápis na linha de cada regra com osso, na aba Regras. Abre a janela da criação com os ossos de agora marcados | o lápis do Spine (em Propriedades lá; aqui na aba Regras, que é a cerca) |
| A chave de etiqueta recém-gravada **se mostra** na linha do tempo (P12) | `keyTagHere`, em `panels/rules-vars.ts` | régua do arroz: *o que eu criei apareceu?* |
| **As provas guardam a queda** (C3) | `roteiro-30.mjs` e `medir-paineis.mjs`: frase inteira, foto, tempo de cada passo, em `backup/provas-quedas/` | — |
| **As provas sobem um Vite quieto** | `ferramentas/provas/vite-quieto.mjs` (novo): sem vigiar arquivos, sem HMR | — |

O Vite quieto conserta uma forma que custou a medição de 05:01: *a prova media
o arquivo que o vizinho estava gravando, e não o que ela abriu* — a página
recarregava no meio, ou a prova pegava uma cópia do módulo que nunca foi montada.

`npm run portas`: `SetRuleChain` saiu da lista. `regras.test.ts`: 91 → 99.
Fotos: `backup/fotos-rodada-final/regras/lote-2_*`.

### v23.0 — Apagar e renomear etiqueta ganham porta, e a lista das Regras volta a se refazer — 29/09/2026

Pelo `EXECUTANDO · as portas das regras` (chat C da rodada final), lote 1.

`DeleteTag` e `RenameTag` existiam desde o degrau 12, e **nenhum botão os
chamava**: a aba Regras criava etiqueta e não apagava nem renomeava.

| Gesto | Onde | Modelo |
|:---|:---|:---|
| Renomear | duplo clique no nome da etiqueta, ou o lápis na linha | Spine (F2 / duplo clique / Rename) |
| Apagar | a lixeira na linha. Etiqueta usada pergunta antes, listando as animações | Spine (Delete) + régua 21 |

Referência com link: `documentos/pesquisa/nova pesquisa/REFERENCIA regras 2026-09-28.md`.
O Spriter tem etiqueta, e o manual dele não diz como se apaga: "não achei".

**Dois defeitos da própria aba, achados pela foto e consertados:**

| Defeito | Forma |
|:---|:---|
| a linha da etiqueta dizia *"abra uma animação"* COM uma animação aberta | acrescentei uma seção à tela e não à assinatura que decide quando a tela se refaz (`varsShape`) |
| "inteira" e "daqui" quebravam letra por letra | herdavam os 30 px de largura do botão de ícone |

**O roteiro, passo 14 (defeito C1).** A espera depois de "Abrir pasta" era de
5 s e passou a 30 s (decisão P39). **O limite de 5 s sempre esteve na beira;
em 22/09 passou por sorte do relógio.** Medido do clique ao documento cheio:
hoje 4,6 s e 5,3 s com a máquina vazia; a v22.8, desempacotada fora da pasta,
5,3 s e 6,2 s; sob carga, 11 a 41 s. O que o passo prova não mudou. A lentidão
de "Abrir pasta" ficou escrita na lista de defeitos, para `io/project-folder.ts`.
**Uma queda sobrou sem explicação:** às 04:42, já com 30 s, o passo 14 caiu uma
vez, e a frase não foi guardada. As sete rodadas seguintes do roteiro e da
sonda passaram. Fica anotado, não escondido.

`npm run portas`: 14 → 12 funções sem porta. `regras.test.ts`: 84 → 91.
Fotos: `backup/fotos-rodada-final/regras/lote-1_*`.

**Medição do fecho, casa vazia (CPU 11%, nenhum `node` de outro chat):**
suíte 4.268 (4.238 verdes, 29 pulados, 1 vermelho: `exportar-e-ajuda.test.ts`,
*"the manual page"*, o do manual pausado) às 04:32–04:34 · `tsc` limpo ·
conformidade 87 de 87 · roteiro 14 de 14 (04:43, 04:44, 04:44) · medir 28 de 28
sem passar da coluna, 19 de 28 cabem na altura.

### v22.9 — Os defeitos do lote 1 do plano finalizar: um arrasto = um Ctrl+Z — 29/09/2026

**O código é do chat A (`EXECUTANDO · finalizar o programa`); o fecho é do chat
C**, porque o chat A foi arquivado antes de receber o PODE. Detalhes nos
Desvios do encargo da rodada final, blocos *"Chat A, 23:55"*.

| O quê | Onde |
|:---|:---|
| os 4 erros soltos de `acoes.test.ts` | `editor/testes/` |
| **Inclinar compensa** ("Não mexer nos filhos" vale para Inclinar) | `viewport/tools/shear.ts` |
| renomear pasta **avisa antes de fundir** | `panels/draw-order*.ts` |
| **a tecla que cala**: tecla da tabela cuja ação não existe diz por quê no rodapé | `ui/shell.ts`, `ui/shell-keys.ts` (novo) |
| **um arrasto = um Ctrl+Z**: com "Não mexer nos filhos", 4 movimentos pediam 8 `Ctrl+Z` | `doc/undo.ts`, classe `GestureGroup` |

A forma do defeito do desfazer: *a junção olha UM vizinho, e o gesto alterna
DOIS comandos.* O teste antigo `eixos-e-chaves.test.ts` (*"a compensação é um
passo de desfazer"*) passava com dois passos na pilha: fica avisado, não mexido.

Mesma medição do fecho da v23.0 acima (as duas versões fecharam juntas, com a
casa vazia). O zip desta versão já traz o lote 1 do chat C no disco: as duas
foram medidas juntas, e não havia como separar sem trocar arquivo de lugar.

### v22.4 — A paleta passa a achar pela DICA: metade da folha por tarefa, de graça — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`, em cima de um achado do chat
da folha por tarefa.

**A pergunta que uma pessoa faz não é *"onde está o Duplicar?"*.** É *"como eu
faço uma cópia com os filhos junto?"* — e o nome do comando é justamente o que
ela não sabe. Até hoje a paleta só achava por esse nome.

**A resposta já estava escrita, e ninguém a lia:** as **55 dicas** dos menus,
todas em português de quem usa. A busca passou a olhar para elas.

| Digita | Acha | Por quê |
|:---|:---|:---|
| `descendentes` | **Os filhos** | *"O osso escolhido, todos os descendentes e os desenhos deles"* |
| `zipa` | **Salvar como pacote** | *"Zipa o projeto num .bonez só…"* |

Nenhuma lista nova e nenhum cadastro. É o mesmo desenho da paleta desde o item
110: a busca sai da **mesma lista que desenha os menus**, e um comando novo
aparece nela no dia em que aparece lá.

**A parte 2 do plano ficou metade mais barata.** A coluna 1 daquela folha — dar
nome de tarefa a cada ação, na língua dele — é o trabalho caro do plano, e
metade já existia.

#### A dica aparece na TELA, e não só na busca

Ao lado do nome do menu, na linha da paleta. Sem isso, a pessoa digitaria uma
palavra, o comando surgiria, e ela não veria **por que**:

> É a regra 21 pelo avesso: não é o programa adivinhando — é ele acertando e
> **não contando por quê**.

Foto: `backup/fotos-paleta/3-a-paleta-acha-pela-dica.png` — `descendentes`
digitado, *"Os filhos"* achado, e a dica inteira embaixo do nome.

#### Provado pela pinça, e não só pelo verde

A mesma busca corre duas vezes sobre o mesmo menu — **uma com a dica, outra
sem** — e exige-se que ela ache na primeira e **não ache na segunda**. É o
vermelho de ontem guardado onde ele não se perde: sem isso o verde seria
explicável, e não diria que é **a dica** que o faz acontecer (regra 28).

#### E uma correção ao plano, que era do Planejador e está escrita lá

O plano afirma *"a paleta lista AÇÕES REGISTRADAS"*. **Ela percorre os MENUS.**
A conclusão não muda — comando que nunca virou ação também não tem item de menu
—, mas o limite é mais estreito: **uma ação só com botão na barra ou no botão
direito também não apareceria na paleta**. Hoje não há nenhuma; se houver, é um
buraco na única ferramenta de achar que o programa tem, e ninguém notaria.

### v22.3 — A barra de espaço deixa de depender de um acidente — 22/09/2026

Pelo `EXECUTANDO · os quatro defeitos do uso`. Achado pelo chat
`O vigia do comando sem porta`, rodando a terceira régua: **`tocar` era o único
dos 22 caminhos com id escrito que pertencia a um painel** — o único que a
tabela prova que pode sumir.

**O defeito é LATENTE, não vivo — e isto foi medido antes de consertar.** Em
todos os caminhos tentados no programa aberto (o interruptor da faixa,
recolher, a aba Curvas, os dois arranjos, `fechar-grupo`, o `Tab`) a ação
existe e a barra de espaço toca.

**A razão está escrita em `ui/shell.ts:783`, e é uma decisão boa e antiga:**

> *"Todos os painéis são montados de uma vez e o que não está à frente fica só
> escondido: um painel derrubado e refeito a cada clique de aba perderia a
> seleção, a rolagem e o campo que estava sendo digitado."*

| | |
|:---|:---|
| aba de **COLUNA** | fecha de verdade, e desmonta o painel — foi o defeito 2, da aba Regras, em 19/09 |
| faixa de **BAIXO** | **não fecha nunca**: o `togglePanel` desvia os `DOCK_PANELS` para o `showPanel` |

**Os dois casos não são o mesmo caso**, e quem for julgar o próximo
`where: 'painel'` precisa saber disso antes de decidir se o silêncio é vivo ou
latente.

> **Não é um corpo que desmente a tabela — é a casca que salva a tabela por
> acidente.** A barra de espaço está protegida por um detalhe que ninguém
> escreveu para protegê-la. No dia em que alguém fizer a faixa montar
> preguiçosamente — uma mudança de desempenho perfeitamente razoável — **a
> barra de espaço morre em silêncio, e ninguém vai ligar uma coisa à outra.**

**O conserto não conserta um sintoma: tira a armadilha.** `tocar` e
`tocar-tras` saem do `mount()` e passam a ser de arranque em
`panels/dopesheet-actions.ts` — os dois só precisam do documento e do tocador,
que é um só para o editor inteiro. O painel continua desenhando os botões.

### Sem par de fotos, e isso está escrito de propósito

Antes e depois **tocam igual**. Montar uma foto que "mostrasse" o defeito
exigiria forçar um estado que nenhum gesto alcança — seria **uma foto com o
nome errado**, que é a coisa que esta madrugada inteira foi escrita para não se
fazer. Lote sem foto não fecha; **este não é um lote visível**, e o Humberto
não tem o que ver nele.

### O irmão, e o buraco que o próprio conserto abriu

Os dois irmãos foram movidos no mesmo lote e **só o `tocar` era exercitado**.
`tocar-tras` ficou sendo *uma ação que existe sempre e cujo corpo nunca rodou
sem painel* — **exatamente o buraco onde o defeito da barra de espaço morava**.
Avisado pelo chat do vigia, pela lista de nomes da quarta régua.

> **Consertar um e deixar o irmão é a régua aplicada pela metade.**

E o teste dele não pergunta *"tocou?"*: pergunta **para que lado**. Um teste que
só olhasse `isPlaying()` ficaria verde no dia em que o `-1` sumisse do `play`, e
o nome *"tocar para trás"* passaria a mentir — o nome é o que se lê. Provado dos
dois lados (regra 26): sem o `-1`, `expected 0.6 to be less than 0.5`; sem o
registro de arranque, dois guardas o acusam pelo nome.

### Os números desta versão são PARCIAIS, e por quê

Medidos às **01h10 de 22/09, com quatro chats gravando**: `acoes.test.ts` 20 de
20, e nenhum erro de `tsc` apontando para os arquivos deste lote. **A suíte
inteira e o `programa/` ficam para o fecho do Planejador, com a casa vazia** —
entre duas rodadas com quatro minutos de diferença os contadores foram de 210
para 214 e de 40 para 43, e um vermelho em `menus.test.ts` apareceu e sumiu
sozinho. Um número parcial e datado vale; um número inteiro medido com a casa
cheia, não.

**O `programa/` não foi remontado de propósito:** montá-lo tiraria a foto do
"antes" dos dois chats de tela que ainda estavam trabalhando.

### v22.2 — A lista que encolheu sozinha, e disse o nome de quem saiu — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`. Lote de uma linha, e é o
fecho da quarta régua.

`tocar-tras` entrou na lista `ALHEIAS` às **01:03**: o `EXECUTANDO · os quatro
defeitos do uso` tinha movido `tocar` e `tocar-tras` de `painel` para
`arranque` no conserto da barra de espaço, e exercitado **só o primeiro**. Eu
não lhe dei estado — exercitar o corpo de uma ação exige saber o que ela deve
fazer, e isso é do dono — e avisei-o por mensagem no mesmo minuto.

Às **01:07** ele exercitou o irmão. Às **01:08** este teste acusou a própria
linha, pelo nome:

> *"tocar-tras: já é exercitada. Tire de ALHEIAS"*

**A lista encolheu, e disse quem saiu.** Um total teria só mudado de número.

#### A régua que fica, e ela tem dois lados

**O aviso por mensagem custou uma frase e resolveu**, e o dono escreveu um
teste melhor do que eu teria pedido: ele não pergunta *"tocou?"* — pergunta
**para que lado**. Um teste que só olhasse `isPlaying()` ficaria verde no dia em
que o `-1` sumisse do `play`, e o nome *"tocar para trás"* passaria a mentir.

E é a prova de que **não dar o estado era o certo**: eu não tinha como saber que
"para trás" se mede na agulha, e um estado chutado teria virado um verde
explicável — passaria, e não provaria o que o nome promete.

| Os dois lados | |
|:---|:---|
| de quem acha | **nome e dono, nunca o estado**, e avise por mensagem no mesmo minuto |
| de quem é avisado | consertar o irmão também. *Consertar um e deixar o irmão é a régua aplicada pela metade* |

A lista nasce vazia outra vez, que é o estado bom.

### v22.1 — A folha por tarefa: o que o programa faz, e por onde se chega — 22/09/2026

Pelo `EXECUTANDO · a folha por tarefa`. Parte 2 do plano
`documentos/planos/COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`, medida às
**01:06**. A v22.0 foi tomada por outro chat enquanto esta era escrita, e o
`versao.py` recusou o número repetido — regra 14 valendo.

#### O que entra

| O quê | Onde |
|:---|:---|
| `npm run tarefas` e `npm run tarefas -- --gravar` | `package.json`, só acrescentando |
| A régua, **uma só**, lida pelo relatório e pelo teste | `ferramentas/provas/tarefas.ts` |
| O relatório | `ferramentas/provas/folha-de-tarefas.ts` |
| O teste dela, 18 casos | `ferramentas/testes/tarefas.test.ts` |
| **A folha**, que é a entrega visível | `documentos/O QUE O PROGRAMA FAZ 2026-09-22.md` |

**Nenhuma linha de `editor/src`.** Havia três chats trabalhando lá.

A folha responde a pergunta do Humberto — *"tem coisas que você me fala que não
tem no menu"* — **por tarefa, e não por menu**: 200 tarefas na língua dele, com
o caminho ao lado (menu, tecla, barra, botão direito) e uma coluna dizendo se
alguma prova faz aquilo de verdade. A coluna do caminho sai das tabelas por
`import`; a da prova, do texto do `roteiro-30.mjs`; **a do nome é a única
escrita à mão, e é o trabalho de verdade.**

#### O achado, e ele vale mais que o lote

A parte 1 deixou escrito que *todo instrumento que se mede junto com o que mede
dá verde*, e mandou o próximo começar por ali. Comecei por ali, e a armadilha
me pegou **noutra forma**, que aquele aviso não cobria:

> **Eu tomei "a tecla foi apertada" por "a ação rodou".**

A coluna Provado nasceu com dez verdes. **Três eram falsos**, e os três só
apareceram porque a pergunta foi *"o que este verde PROVA?"* — e não *"por que
este verde é explicável?"*, que é a pergunta que passa (regra 28):

| O verde | O que ele provava de verdade |
|:---|:---|
| `novo` | **nada**: o `runAction('novo')` que o medidor achou estava dentro de um **comentário** do roteiro |
| `desmarcar` | que o roteiro aperta `Esc` — mas quem come o `Esc` é a ferramenta na mão, e isso não está em tabela nenhuma |
| `virar-filho` | que o roteiro segura `P` — que é o **gesto** `pegar-filhos`, e não a ação do menu que declara a mesma tecla |

O primeiro é a armadilha da parte 1 em miniatura: **o medidor leu o que alguém
escreveu SOBRE a prova, e não a prova.** Os outros dois são a forma nova: quem
responde a uma tecla é decidido na hora — pela ferramenta na mão, pelo foco,
pelo painel montado —, e nada disso está numa tabela que um medidor sem
navegador possa ler. Duas linhas da tabela de teclas podem declarar a mesma
tecla, e só uma atende.

Conserto: a tecla **deixou de contar como prova** e passou a sair na folha como
`~`, uma quase-prova com o nome dela — medida, e nunca chamada de prova. Os
comentários saem do texto antes da varredura. De dez verdes sobraram **seis**, e
os seis são verdade.

#### As cinco guardas, provadas vermelhas uma a uma

Regra 26: um teste que nunca se viu falhar não é um teste. Quebrei cada guarda
de propósito e conferi que o vermelho sai **no caso certo**:

| A quebra | O caso que ficou vermelho |
|:---|:---|
| pôr um arquivo do medidor em `AS_PROVAS` | *nenhum arquivo do medidor está na lista das provas* |
| tirar uma tarefa do dicionário | *toda ação tem nome de tarefa, ou motivo escrito* |
| pôr uma tarefa que aponta para ação inexistente | *nenhuma tarefa nomeada aponta para ação que não existe* |
| fazer o comentário contar de novo | *o que está num comentário não conta como prova* |
| fazer a tecla contar de novo | *a tecla apertada não conta como prova* |

E um sexto vermelho que **não** foi de propósito: o caso *"toda tarefa começa
por verbo, e não pelo nome do menu"* pegou **quatro nomes meus** — *"Escolher
tudo"*, *"Desescolher tudo"*, *"Destravar tudo"*, *"Afastar-se"*. Eram o rótulo
do menu com um verbo na frente, e não dizem o que a pessoa quer. Reescritos.

#### Dois buracos que a folha anuncia em vez de esconder

| O quê | Como ela diz |
|:---|:---|
| **Malha e pesos não tem uma linha** | tudo ali é botão dentro do painel, e botão de painel não tem linha em tabela de menu, de tecla nem da barra. A folha imprime o aviso, e o teste exige que a lista de assuntos vazios seja **essa**, escrita |
| **As 14 que não são tarefa** | são os itens que só abrem submenu. Eram dispensados por uma régua automática e **não apareciam em lugar nenhum da folha** — 14 ações desaparecendo em silêncio. Agora saem numa tabela, com o motivo |

#### Uma correção ao plano

O plano diz que *"a paleta lista ações registradas"*. Ela não: `filterCommands`
(`ui/palette.ts`) percorre os **menus**. Uma ação que só tivesse botão na barra
ou no botão direito não apareceria nela — e a Paleta é justamente o que se abre
quando não se sabe onde a coisa está. Hoje não há nenhuma nesse caso (as 200
têm item de menu), e a folha tem a seção pronta para o dia em que houver.

### v22.0 — As oito que nunca rodavam passam a rodar, e a nona é de outro dono — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`. Segundo degrau da quarta
régua, medido às **01:04**.

#### O buraco que elas eram

O guarda de efeito do `acoes.test.ts` roda cada ação de arranque no herói
recém-aberto, com nada escolhido, e pula a que fica cinza — **e está certo**,
cinza é resposta. Só que **oito ficavam cinzas em todo estado que aquele teste
monta**, e nenhum outro teste daquele arquivo as chamava: **o corpo delas nunca
rodou, em lugar nenhum.**

É onde um corpo preso ao painel se esconderia. Uma delas podia estar há semanas
com o defeito do `this.doc` dentro, e a suíte inteira passaria.

#### As oito, e o estado que cada uma precisava

| Ação | Estava cinza por |
|:---|:---|
| `novo-ponto-no-slot` · `novo-caixa-no-slot` | sem um slot escolhido |
| `descer-ordem` · `frente-de-tudo` | sem desenho escolhido |
| `tirar-da-pasta` | sem peça de pasta escolhida |
| `copiar-ordem-animacao` | sem animação aberta |
| `copiar-pose-escolhido` | sem animação aberta, e sem nada escolhido que tenha pose |
| `limpar-slots-vazios` | sem nenhum desenho vazio no arquivo |

Cada uma ganha o estado e então se exige o que a tabela promete: **sem painel
nenhum montado, ou o arquivo muda, ou o programa diz por que não.** As oito
passam — nenhuma tinha o defeito escondido. **Agora, se alguma passar a tê-lo,
alguém vê.**

E há a prova de que o bloco acusa (regra 26): uma ação de mentira com o corpo
preso à tela — `const doc = this.doc; if (doc === null) return;`, o molde exato
do defeito de 22/09 — roda, devolve `true`, e não faz nem diz nada. O teste a
pega.

#### A nona é de outro dono, e por isso só tem nome e motivo

`tocar-tras` também não é exercitado por ninguém. Ele e o `tocar` saíram de
`painel` para `arranque` no conserto da barra de espaço, e o guarda do dono
exercita o `tocar` — não o irmão.

**Não lhe dei estado de propósito.** Exercitar o corpo de uma ação exige saber o
que ela deve fazer, e isso é do dono. A linha traz o **nome e o dono**, e o dono
foi avisado por mensagem no mesmo minuto:

> Uma régua que aparece como vermelho na tela de alguém sem aviso vira dedo
> apontado, e deixa de ser lida.

A lista **encolhe sozinha**: quando ele exercitar o `tocar-tras`, o teste acusa
a linha que já não vale, com o nome — *"já é exercitada. Tire de ALHEIAS"*. Uma
lista que não encolhe passa a mentir.

### v22.7 — A ficha da 1ª fase do emissor, e o número que piorou — 22/09/2026

Pelo `EXECUTANDO · as particulas na tela`, lote 3 de três. **O volante está
completo:** cria-se um emissor pelo Novo ▾, vê-se ele na Árvore, vê-se as
partículas na cena, e agora **mexe-se em todos os campos da 1ª fase**.

#### 1. Nove grupos, e nenhum campo da 2ª fase

A tabela da 1ª fase está em `documentos/programa-novo/07`. Ficam de fora a taxa
animada por integral (§4.2), o sub-emissor, o rastro e o ruído.

| Grupo | O quê |
|:---|:---|
| **O emissor** | o slot (só leitura), a semente, o espaço (do osso / do mundo) |
| **Quando nasce** | Emitindo, Taxa por segundo, Atraso, Explosividade, Janela da explosiv., Tremor ao nascer |
| **Vida e teto** | Vida (mínimo/máximo), Máximo de vivas (teto do formato: 10 000) |
| **Para onde vai** | Velocidade (min/máx), Direção, Abertura p/ cada lado, Sair do centro, Virar para onde vai |
| **De onde sai** | Forma (as **seis** da §9.4), Raio, Anel, Trecho do círculo, Retângulo, Malha, Onde na malha |
| **Forças** | Gravidade X/Y, Arrasto |
| **Giro e tamanho** | Giro inicial, Giro por segundo, Tamanho — as três em faixa |
| **Cor** | Cor ao nascer (de) e (até): §9.7 é um par de cores |
| **A imagem de cada partícula** | Imagem da partícula, A folha corre, Voltas na vida, Quadros por segundo, Quadro de partida |
| **A volta e a ordem** | Repetir com a animação, Pré-aquecer, Quem fica na frente |

Três rótulos carregam a regra que não se adivinha: **"Abertura p/ cada lado"**
(§9.3: `spread` é *meia*-abertura, e quem espera a inteira põe o dobro),
**"Pré-aquecer (só sem repetir)"** (§6) e **"Janela da explosiv."** — que **não**
se chama "Duração", porque `duration` é só para a explosividade e o laço usa a
duração da animação (§9.1). Um campo chamado "Duração" numa ficha de emissor
seria lido como *"quanto tempo o efeito dura"*, que é outra coisa.

#### 2. O defeito que este lote encontrou antes de escrever a ficha

Meia dúzia de campos do emissor são faixas `[min, max]`. Cada uma é **um** campo
no arquivo e **dois** na ficha, e o jeito óbvio de ligar os dois é apontar para
`/…/lifetime/0`.

**O jeito óbvio quebra o arquivo em silêncio.** O `setAtPointer` cria o
recipiente que falta e, vendo um índice numérico adiante, cria um array — **com
um elemento só**. O schema da extensão exige `minItems: 2` e o runtime lê
`faixa[1]` para o máximo: um `"lifetime": [2]` daria máximo `undefined`, e a
vida de toda partícula sairia `NaN`. **Inválido de um jeito que a tela não
mostra**, que é a pior espécie.

Foi medido no `setAtPointer` **antes** de a ficha existir, e está preso num
teste que mostra o array de um elemento. `rangeFieldCommand` grava a faixa
inteira, sempre: lê o par que está lá (ou o padrão da extensão), troca um
componente, grava os dois. Um par torto vindo de fora volta ao padrão em vez de
virar outro torto, e um valor que não é número cai no padrão daquela ponta —
nunca em `NaN`. Como é um `SetProperty` comum no ponteiro da faixa, o desfazer e
a fusão de arrasto continuam valendo de graça.

Um segundo par do mesmo tipo: o índice de `startColor/0` vai **colado** no
ponteiro, e não como token do `pointerOf` — ele escapa a barra de um token e
`startColor/0` sairia `startColor~10`, um ponteiro que não acha nada. Também
medido por teste.

#### 3. A linha do lote 1 que SAIU, porque virou mentira

No lote 1 a ficha dizia, por escrito, *"na cena: ainda não desenha — o desenho
entra no próximo lote"*. Era a regra 21 fazendo o seu trabalho. No lote 2 a cena
passou a desenhar, e **uma promessa cumprida que fica na tela vira mentira** —
pior que a falta que ela cobria: quem a lesse desconfiaria do jorro que está
vendo. A linha saiu, e um teste prende que nenhum campo da ficha diga "não
desenha".

#### 4. O NÚMERO, e ele piorou

O encargo mandou medir **e escrever, mesmo que piore**. Medido na tela às 01h34,
em 1440×900, com o arranjo de fábrica:

| | A ficha pede | O painel tem | Falta |
|:---|---:|---:|---:|
| Antes (ficha mínima do lote 1) | 484 px | 343 px | **141 px** |
| Depois (a 1ª fase inteira) | 2 736 px | 343 px | **2 393 px** |

**A ficha do emissor engordou 2 252 px.** São 100 rótulos no painel, e o painel
de Propriedades tem 343 px de altura no arranjo de fábrica. É o maior assunto
do editor por uma margem larga, e nenhuma escolha de rótulo conserta isso.

**306 px foram devolvidos pelos rótulos, e a foto é que mostrou onde.** A
primeira medição deu 3 042 px: os rótulos longos que eu havia escrito —
*"Emitindo (esta é a chave que se anima)"*, *"Espessura do anel (0 borda, 1
cheio)"* — quebravam em **três linhas** na coluna de 130 px. Encurtados, a ficha
caiu para 2 736 px sem perder nenhuma das três regras que não se adivinham.

**Os 2 393 px que faltam são um pedido de desenho, e ficam escritos aqui em vez
de resolvidos às escondidas:** nove grupos que recolhem, ou uma segunda coluna,
ou abas dentro da ficha. É decisão do Humberto, e o grupo "Compensar" vindo
antes da ficha do assunto (achado pela foto do lote 1) é parte da mesma conversa.

#### 5. As provas, e o par de fotos

Os três arquivos do lote, medidos às **01h34** de 22/09: **334 verdes, nenhum
vermelho** (`paineis` 111, `cena` 88, `arvore` 135), `tsc` limpo. **21 testes
novos** neste lote, **54** nos três.

| Foto | O que ela mostra |
|:---|:---|
| `lote-3_antes.png` | a ficha mínima do lote 1: "No slot" e "Semente", e nada por onde mexer no efeito |
| `lote-3_depois.png` | os nove grupos, com a medida da altura ao lado no preparo |

### v22.6 — As partículas na cena: já desenhavam, e o que não desenha agora AVISA — 22/09/2026

Pelo `EXECUTANDO · as particulas na tela`, lote 2 de três.

#### 1. A primeira coisa que este lote descobriu foi que ele não precisava existir inteiro

Fui escrever o desenho das partículas na cena e **a cena já desenhava**. O
editor posa o esqueleto e o entrega ao `CanvasRenderer` do runtime; esse
desenhador já sabe o que fazer com um emissor — `BONE_particle` está em
`DRAWABLE_TYPES` e o `drawParticles` põe cada partícula onde o
`computeParticles` diz. Medido na tela às 01h05, com o herói: **45 partículas
jorrando do antebraço**, com giro e gravidade, e "Nenhum aviso".

**Escrever um segundo desenho seria desenhar duas vezes**, e nenhuma linha foi
escrita ali. Está anotado porque o próximo a ler o encargo vai procurar esse
código e não vai achar.

#### 2. A régua inteira da extensão, provada NO CAMINHO DA TELA

> *O quadro no tempo `t` é função pura de (arquivo, animação, `t`).*

Dezesseis casos de conformidade provam que o **motor** a cumpre. O que faltava
era provar que a **tela** cumpre. Agora está preso em `cena.test.ts`, pelo
caminho do editor de ponta a ponta — o `Doc`, a animação aberta, a agulha — e
pela **mesma porta que o desenhador usa** (`particleFrame`, com um
`ParticleCache` compartilhado, como ele faz):

| Passo | Resultado |
|:---|:---|
| 0,50 → 0,10 → 0,80 → 0,50 s | as **mesmas** 45 partículas, dígito por dígito |
| 0,50 contra 0,10 | diferentes — sem esta linha o teste passaria com uma assinatura vazia |
| Fechar a animação e reabrir | o mesmo quadro |
| Base aberta (sem animação) | o emissor continua entregando: §6, o relógio do esqueleto |

**O palco inteiro, em pixels, NÃO bate — e não é das partículas.** O `cape_path`
e o cabelo do herói andam numa regra de **física**, e física **guarda estado de
propósito**: o próprio runtime diz isso por escrito, e esta extensão foi escrita
para ser o contrário dela. Medido em duas rodadas separadas, cada uma de página
nova: **com** emissor e **sem emissor nenhum**, o mesmo passeio muda os **mesmos
561 pixels**, na mesma caixa `[404,121]–[431,176]` — a região do cabelo, longe do
jorro.

**Isso quase virou um vermelho falso relatado.** A primeira medição disse
"QUADRO DIFERENTE" e a culpa ia cair nas partículas, que estavam certas. O que
a salvou foi medir de novo **sem emissor nenhum** — e é por isso que a régua do
instrumento não vai dentro do preparo do passeio: um segundo passeio parte de um
estado de física diferente do primeiro e dá outro número, sem querer dizer nada.
*Instrumento que se mede junto com o que mede não presta.*

#### 3. O trabalho de verdade: um emissor que não desenha nada DESAPARECE

E desaparecer é indistinguível de estar quebrado.

O runtime até avisa — `drawParticles` chama `onWarning` para forma desconhecida,
malha que falta, emissor sem região de atlas, partículas cortadas, ciclos de
rajada fora da volta. E **a cena do editor não liga o `onWarning`**: ele cai num
`() => {}`. Conferido no disco: o único lugar do editor que o liga é
`io/export-image.ts`.

Então o primeiro gesto de quem usa — criar um emissor e apertar Tocar — dava
**tela igual e nenhum aviso**. Um emissor recém-criado não tem imagem (§9.8: sem
`path`, o nome do anexo serve de nome de região, e nome de anexo não é nome de
imagem), o desenhador desiste do emissor inteiro, e a cena fica igualzinha. É a
regra 21 da casa, e é o buraco que este lote tapa.

`viewport/particles-view.ts` (novo, puro) decide, e `drawEmitterWarnings` desenha
um anel tracejado **onde o emissor está**, com a palavra curta ao lado:

| Situação | Na cena | Por extenso |
|:---|:---|:---|
| Sem imagem | `sem imagem` | *o emissor "X" não tem imagem: escolha uma em Propriedades* |
| Forma desconhecida (§7.4) | `forma desconhecida` | *…: ele não é desenhado (a forma está na barra de avisos)* |
| `shape: "mesh"` sem malha | `sem malha` | *…e não diz qual malha: escolha uma em Propriedades* |
| Taxa 0 e nenhuma rajada | `taxa 0` | *…: nada nasce* |
| `emitting` desligado | `emissão desligada` | *…* |

**O aviso não passa por interruptor de Exibição, de propósito**: não é uma camada
que se liga e desliga, é um aviso — e aviso que se pode desligar é aviso que não
avisa. Ele só aparece quando há o que dizer, e um slot escondido no editor não
avisa nada: *esconder também é um efeito*.

#### 4. Duas coisas que a FOTO pegou e nenhum teste pegava

**A frase corria para fora da borda do palco.** Desenhada no espaço do
esqueleto, ela cresce com o zoom, e o que chegava aos olhos era *"…escolha uma
em Prop"*. **Aviso cortado no meio é pior do que aviso curto.** Daí as duas
formas: a cena mostra a curta, e a frase inteira fica para onde há largura. Um
teste prende que nenhuma curta passa de três palavras, ou a próxima volta a
estourar.

**O traço de 2 px desaparecia** sobre o desenho colorido do herói, que é
justamente onde o emissor costuma estar. Foi para 2,5 px de tela, e o anel ficou
um pouco maior.

#### 5. Uma promessa que o código não podia cumprir, tirada antes de virar mentira

A frase da forma desconhecida ia repetir a palavra do arquivo — *"a forma
'redemoinho' é desconhecida"*, que é a frase melhor. **E ela não é possível:** o
carregador já trocou a forma desconhecida pelo padrão `point` e só deixou o
`shapeKnown: false`. Imprimir `attachment.shape` diria *"a forma 'point' é
desconhecida"* — falso, e falso de um jeito que manda a pessoa procurar a palavra
errada no arquivo. A palavra crua vive na advertência do carregador; a frase da
cena manda para a barra de avisos. Um teste prende as duas metades.

#### 6. As provas, e as quatro fotos

Os três arquivos do lote, medidos às **01h20** de 22/09: **316 verdes, nenhum
vermelho** (`cena` 88, `arvore` 135, `paineis` 93), `tsc` limpo. **13 testes
novos** neste lote, **33** nos dois.

Em `backup/fotos-particulas/`, com os preparos ao lado:

| Foto | O que ela mostra |
|:---|:---|
| `lote-2_antes.png` | o emissor existe (Propriedades o nomeia) e **a cena não diz uma palavra** sobre ele. Tirada com o `viewport-draw.ts` devolvido do `backup/` e o `particles-view.ts` fora |
| `lote-2_depois.png` | o anel tracejado no antebraço e `sem imagem` ao lado |
| `lote-2_jorrando.png` | **45 partículas saindo do antebraço do herói**, com giro e gravidade, em 0,50 s. É a foto que ele pediu |
| `lote-2_jorrando-de-volta.png` | o mesmo instante depois de a agulha ir a 0,10, a 0,80 e voltar. O preparo mede as partículas e diz: *MESMAS, dígito por dígito* |

### v21.9 — O volante: o emissor de partículas existe, e se vê que existe — 22/09/2026

Pelo `EXECUTANDO · as particulas na tela`, lote 1 de três.

O degrau 12 construiu o motor inteiro e parou antes do volante. 🗣️ *"Tem um
sistema de partícula decente. Eu não vejo claramente como é que isso funciona no
nosso aplicativo. (…) O carro sem o volante. Você está brincando sozinho."*

| Onde | Estava | Está |
|:---|:---|:---|
| A extensão `BONE_particles` | escrita, com schema e validador | igual |
| Os **dois** runtimes | calculam posição, ângulo, cor, quadro | igual |
| **16 casos** de conformidade | provados nos dois | igual |
| **No editor** | **nada. Nenhum botão** | **Novo ▾ → Emissor de partículas** |

#### 1. O emissor nasce por uma porta, e só uma

`AddParticleEmitter` (`panels/tree-commands.ts`), no molde do Ponto e da Caixa:
o slot e o anexo `"type": "BONE_particle"` nascem juntos e morrem juntos, num
passo de desfazer. A porta é o id **`novo-emissor`**, um só, e os dois lugares
que o chamam — o **Novo ▾** da Árvore e **Esqueleto → Novo** — chamam o mesmo.

Ele faz uma coisa que nenhum irmão dele faz: **escreve `extensionsUsed`**. A
§2.7 da spec exige que todo `type` prefixado declare a extensão, e sem isso o
arquivo nasce inválido — inválido de um jeito que só o validador vê, que é a
pior espécie. O desfazer tira a declaração **só se este comando a pôs**: um
arquivo com outro emissor continua declarando, porque ela continua sendo usada.

#### 2. A semente é diferente por emissor, e não é sorteada

§9.9, com essas palavras: *"Duplicar um emissor **DEVE** dar semente nova — é o
defeito do Unity, e é o que faz duas fogueiras lado a lado parecerem a mesma
fogueira."* A spec diz também que isso é **regra de editor**: um leitor só lê o
número do arquivo. Então é aqui, ou em lugar nenhum.

`freshSeed` devolve o **menor inteiro livre** — `0`, `1`, `2` —, e não um
sorteio, por dois motivos que pesam mais do que "parecer aleatório": um
`Math.random` faria o mesmo gesto gravar arquivos diferentes a cada vez, e o
`pcg` da §3.2 é um **hash**, não um contador — `0` e `1` dão fluxos de acaso sem
parentesco nenhum. O número sai no **construtor** e fica guardado: lê-lo do
arquivo vivo dentro do `apply` faria o refazer tirar outro, e o refazer deixaria
de ser o inverso do desfazer (a forma do defeito 1 de 19/09).

#### 3. Se vê que existe: o ícone, o nome em português, a ficha

| Onde | O quê |
|:---|:---|
| `panels/thumbnail-kind.ts` | uma linha em `POR_TIPO`: ícone `particle`, tipo **"emissor de partículas"**. Sem ela o emissor caía no buraco do fim do arquivo — o ícone genérico e, na dica, `"BONE_particle"` cru, em inglês e com prefixo |
| `ui/icons.ts` | o ícone `particle`: a boca cheia embaixo e o que sai dela diminuindo. **Não é o do Ponto**: emprestar aquele faria a linha dizer "um ponto" onde há um emissor |
| `panels/properties-model.ts` | o grupo **"O emissor"**: o slot (só leitura), a **Semente** (0..4294967295, e `0` é válida) e a linha "Na cena", que **diz** que o desenho vem no próximo lote |

O campo "Imagem" do anexo comum **saiu** da ficha do emissor: o `path` dele é a
imagem de **cada partícula** (§9.8), não o desenho do anexo, e um campo que
parece fazer uma coisa e faz outra é o que a regra 21 proíbe.

#### 4. Um defeito achado no caminho, e ele era mais largo que o emissor

Num arquivo **sem `slots`** — um esqueleto que só tem ossos — criar e desfazer
deixava `"slots": []` para trás. O arquivo não voltava letra por letra, e o
comentário da linha de baixo, a das peles, já dizia por escrito que ele tem de
voltar.

**A forma:** *criei duas listas e só cuidei de uma no desfazer.* Vale para o
**Ponto, a Caixa e a Máscara**, que herdam o mesmo `apply` — o emissor só foi o
primeiro a passar por um arquivo cru, porque o herói já tem vinte slots e nenhum
teste partia de um que não tem. Consertado no `AddSlotWithAttachment`, com teste
pelo Ponto.

#### 5. As provas, e o par de fotos

Os dois arquivos do lote, medidos às 01h03 de 22/09: **228 verdes, nenhum
vermelho** (`arvore` 135, `paineis` 93), `tsc` limpo. **20 testes novos.**

O par está em `backup/fotos-particulas/`, com o preparo ao lado, e as duas fotos
saem do **mesmo** preparo — a única diferença entre elas é o código:

| Foto | O que ela mostra |
|:---|:---|
| `lote-1_antes.png` | o ícone genérico na Árvore e a ficha **"Nome / Imagem"**, sem uma palavra sobre o emissor. Tirada com os três arquivos devolvidos do `backup/` |
| `lote-1_depois.png` | o ícone do emissor, a dica "emissor de partículas", o grupo **"O EMISSOR"** com a semente 0 e o aviso, e o rodapé dizendo a semente |

**A foto pegou uma coisa que nenhum teste pegava**, e é por isso que ela existe:
na primeira tentativa o grupo "O emissor" estava no modelo e **não chegava aos
olhos** — em Propriedades o "Compensar" vem primeiro, e num painel curto o resto
cai abaixo da borda. O preparo passou a rolar até ele. E na segunda tentativa a
foto de "antes" foi **sobrescrita** pelo código novo, porque o preparo é o mesmo:
ela foi refeita com os arquivos do `backup/` no lugar.

### v21.7 — O nome do arquivo que enganaria, e o número que não é meu de prender — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`. Três consertos pequenos na
quarta régua, e os três são de **convivência**, não de conta.

#### 1. O nome de um arquivo é a primeira coisa que engana

`editor/testes/efeito.test.ts` durou dez minutos. Ao lado dele nasceu, na mesma
hora e de outro dono, `editor/testes/efeitos.test.ts` — os três efeitos
visuais. **Uma letra de diferença, dois assuntos sem relação nenhuma.**

Alguém abriria o errado, mediria o errado e relataria o errado, às três da
manhã, quando ninguém confere duas vezes. O arquivo passou a chamar-se
**`existir-nao-e-funcionar.test.ts`**, que é o nome da régua.

#### 2. O que não é meu, eu não prendo

A conta das ações que terminam numa janela saiu das asserções. A lista é do
`acoes.test.ts`, de outro dono, e foi de **6 para 9** em onze minutos. Prender o
tamanho dela seria prender o trabalho dele — **o mesmo erro que prender o total
seria**, uma camada adiante.

O que fica preso é a **regra**: quem termina numa janela **não conta como
exercitada**, porque não foi exercitada. *Chamar não é exercitar.*

#### 3. Os números, com o quando e o porquê ao lado

| Hora | Ações de arranque | Por causa de quê |
|:---:|:---:|:---|
| 00:48 | 37 | — |
| 00:52 | 38 | `novo-emissor`, do chat das partículas |
| 00:54 | 40 | mais duas |
| 00:59 | **43** | `tocar` e `tocar-tras` saíram de `painel` para `arranque` |

**E a lista encolheu sozinha:** `efeito-flash`, `efeito-pulso` e `efeito-tremor`
nasceram cinzas às 00:55 e às **00:59 já exercitavam o corpo** — o dono deu-lhes
corpo enquanto esta seção era escrita. **Um total teria só mudado de número, sem
dizer quem entrou nem quem saiu.** É para isso que a lista é por nome.

#### A régua de convivência que este lote deixa, e o erro é meu

Quatro vezes nesta madrugada eu criei um `zz-*.test.ts` em `editor/testes/`
para medir, rodei e apaguei. Às 00:59 um deles apareceu como *"arquivo não
encontrado"* no `tsc` de outro chat, que foi caçar um defeito que já não estava
lá.

> **Pus o meu rascunho na pasta que a casa inteira mede.**

`editor/testes/` está no `include` do `tsconfig`: enquanto o arquivo existe, ele
é de todos. E **um arquivo que some é pior que um arquivo errado** — o errado
alguém lê e conserta; o que evapora manda a pessoa duvidar da própria medição.

Não havia desculpa técnica: **uma hora antes eu já tinha feito certo**, medindo
a terceira régua por `vite-node` num script do rascunho, sem tocar em
`editor/testes/`. Tinha a ferramenta certa na mão e usei a errada por comodidade.

> **Medição de rascunho roda de FORA da pasta que a casa mede.** Se precisar de
> código inventado, ele vai como **texto dentro do próprio teste** — que é como
> as três réguas já recebem o mapa de arquivos.

Irmã da régua do chat dos efeitos (*escreva e meça na mesma volta, sem deixar
respirar*), com um lado a mais: **não é só não deixar respirar; é não pôr no
pulmão dos outros.**

### v22.5 — A folha animada do Aseprite entra arrastando — 22/09/2026

Pelo `EXECUTANDO · flash, pulso e tremor`. O item 1 da §6 de `COMO SE FAZ
EFEITO 2026-09-16.md` — *"folha animada entra arrastando (pasta numerada ou
folha do Aseprite → `sequence`)"* — **estava feito pela metade, e a metade que
faltava era a folha.**

#### O que já existia, e não foi reescrito

A **pasta numerada** vira sequência desde o degrau 8, tarefa 8.6:
`numberedSequence` em `io/drop-plan.ts`, com porta no botão direito da subpasta
da aba Imagens e no arrasto de arquivos. A primeira coisa deste lote foi medir
isso — e não reescrever nada. Uma segunda conta fazendo o que a primeira já faz
diverge em uma semana, e ninguém sabe qual está certa.

#### O que acontecia com a folha, medido antes de mudar

Soltar `chama.png` + `chama.json` (a exportação do Aseprite) dava:

> **Nenhum projeto de Spine, DragonBones ou Spriter entre os arquivos
> escolhidos.**

O `dropPlan` — que só vê **nomes** — mandava o par para `{kind: 'outro'}`,
levando **só o `.json`**; o PNG ficava de fora. O `detectFormat` devolvia `null`
porque não é nenhum dos três. Avisar em vez de improvisar está certo (regra
21), mas aqui dá para fazer. **Os dois estados estão fotografados**, e a foto
de "antes" chama o caminho velho de verdade, com a folha de verdade.

#### A conta não tem conversão de eixo, e isso não é sorte

A **§10.1 põe a origem da região do atlas no canto superior esquerdo, com Y
para baixo** — que é exatamente o sistema do Aseprite. O `frame` de cada quadro
entra um para um em `x, y, width, height`.

**A única conta é o corte.** O Aseprite dá `spriteSourceSize.y` contando do
**topo**; o `offsetY` da §10.3 conta de **baixo**, Y para cima, igual ao Spine.
Trocar os dois põe o desenho de cabeça para baixo dentro do próprio quadro — e
o defeito só aparece em arte **cortada**, que é a que ninguém testa.

#### O conteúdo desempata, nunca a extensão

`.json` é a extensão mais disputada do arrasto: Spine, DragonBones, o `.scon` do
Spriter e o atlas do próprio Recorte terminam todos nela. Então `io/drop-plan.ts`
só aponta o **par candidato** pelo nome (`asepritePair`), e quem decide é o
conteúdo (`isAsepriteSheet`, pelo `meta.app`). Com várias imagens e nenhuma de
mesmo nome do `.json`, ele **não adivinha** qual é a folha.

#### Onde ela desemboca: no que já existia

Os quadros saem nomeados na convenção da §7.10 — `chama_01 … chama_04` —, e por
isso o `numberedSequence` os reconhece **sem uma linha nova**. A diferença entre
a folha e a pasta é toda esta: a pasta traz N imagens, e cada uma vira uma
página de UMA região; a folha traz UMA imagem, e ela vira uma página de N
regiões (`withSheet`, em `io/project-folder.ts`). Daí para a frente é o mesmo
anexo `sequence`, criado pelo **mesmo comando** do botão direito da subpasta.

| Arquivo | O quê |
|:---|:---|
| `editor/src/io/aseprite-sheet.ts` | novo, puro: reconhecer, cortar, nomear, ler etiquetas e durações |
| `editor/src/io/drop-plan.ts` | `asepritePair`: o par candidato, pelo nome |
| `editor/src/io/project-folder.ts` | `withSheet`: uma página, N regiões |
| `editor/src/io/folder-atlas.ts` | `ensureSheet`: os pixels e as regiões no documento vivo |
| `editor/src/ui/shell-drop.ts` | o ramo do arrasto, antes do `switch`, porque só ali se lê o conteúdo |
| `editor/testes/folha-animada.test.ts` | 26 casos, três deles medindo o comportamento de **antes** |

### v21.8 — Flash, pulso e tremor: três efeitos que gravam chaves e somem — 22/09/2026

Pelo `EXECUTANDO · flash, pulso e tremor`. A pesquisa de 16/09 (`COMO SE FAZ
EFEITO`, §6) chamou os três de **"só porta"**: o programa já conseguia fazer e
não oferecia. Agora oferece, em **Animação → Efeitos**, e nenhum dos três é
campo novo no formato nem função nova no runtime.

| O gesto | O que grava |
|:---|:---|
| **Flash…** | três chaves de `slot/darkColor` no desenho escolhido: apagado, aceso, apagado |
| **Pulso…** | três chaves em `bone/scaleX` e `scaleY`, as duas primeiras **suaves** |
| **Tremor…** | uma sequência de chaves de `bone/x` e `y`, sorteadas por uma semente fixa |

#### A regra de ouro dos três

**Eles gravam chaves e somem.** Não são um campo novo, não são um modo, não são
estado escondido: depois de aplicados, o que fica na linha do tempo são chaves
iguais às que a pessoa faria à mão — dá para mexer, apagar, copiar, e o
`Ctrl+Z` desfaz num passo só. O teste `efeitos` prende isso por fora: a lista
de campos de primeiro nível do arquivo é a **mesma** antes e depois dos três, e
as chaves não carregam nada além de `time`, `value` e `curve`.

#### O flash é `darkColor`, e essa escolha é o lote inteiro

A fórmula da 7.12 é `out.rgb = tex.rgb × light.rgb + (1 − tex.rgb) × dark.rgb`.
Com `dark = (1, 1, 1)` o pixel vai a **branco puro** seja qual for a textura —
é o piscar de quem levou dano, exato, sem shader e sem blend aditivo.

Escrito em `color`, que **multiplica**, um flash branco sobre arte clara não
mudaria um pixel: a ação existiria, o arquivo cresceria, o teste ficaria verde
e **a tela continuaria igual**. É *"existir não é funcionar"* uma camada mais
funda do que a de 19/09 — não no comando nem na ação, mas **na conta**. Antes
de escrever, foi conferido que o `CanvasRenderer` do runtime aplica o tint
black de verdade (`runtime/src/render/canvas.ts`): sem isso, a conta estaria
certa e a tela continuaria mentindo.

#### O acaso do tremor é o `pcg` da extensão, bit a bit

O tremor sorteia com o `pcg` da §3.2 de `formato/extensions/BONE_particles.md`,
e não com uma conta nova. **Duas contas de acaso na mesma casa divergem, e
quando divergem ninguém sabe qual está certa** — a de lá já está provada por
dezesseis casos de conformidade em dois runtimes independentes. O primeiro
teste do arquivo confere os cinco valores de referência da §3.2, que é o que a
própria spec manda conferir antes de qualquer caso.

O que **não** veio de lá é a tabela de canais da §3.3: aquela é dos campos de
um emissor, e está congelada para eles. Um tremor não é um emissor — não emite
nada e não guarda semente.

**E o defeito do Unity não tem como acontecer aqui** (`OS ERROS QUE NAO VAMOS
REPETIR`, §9): lá, duplicar embaralha a semente e a animação sai outra. Aqui
não há semente guardada para embaralhar. Duplicar copia os números que já estão
na linha do tempo, e eles são os mesmos para sempre.

#### Onde o código ficou, e por quê

A conta inteira está em `editor/src/anim/efeitos.ts`, módulo puro sem tela
nenhuma. As três portas estão em `editor/src/ui/efeitos-actions.ts`, porque
`anim/` é o degrau 1 e **não pode importar o registro de ações**, que é o
degrau 3 — é o mesmo molde de `panels/rules-actions.ts`, nascido horas antes
pela mesma razão. As três são de **arranque**: valem com qualquer aba fechada,
porque a escolha vem de `doc.selection` e o tempo de `doc.time`.

Cada gesto tem duas etapas, e a primeira **não escreve nada**: o `planoDo*` lê
o arquivo e devolve a lista de chaves, e a janela chama esse plano a cada tecla
para a prévia dizer o que vai acontecer **antes** de acontecer. Sem plano
possível, ele volta com o motivo escrito — nunca com um silêncio (regra 21).

### v21.6 — A quarta régua: "existir não é funcionar", e o número escrito que caiu duas vezes em seis minutos — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`, em **arquivo próprio**
(`editor/testes/efeito.test.ts`) — o `acoes.test.ts` está com a mão de outro
chat, e a pergunta é outra. A forma veio do `EXECUTANDO · os quatro defeitos do
uso`, e o crédito é dele:

> **Dei porta à ação e deixei o corpo dela dependendo da tela.**

#### O que já estava coberto, e o que faltava

O `acoes.test.ts` dele já exige efeito de cada ação de arranque — *ou muda o
arquivo, ou diz por que não*. **É um bom teste**: julga a promessa contra o
fato, e escreve as que terminam numa janela em vez de deixá-las passar caladas.

Mas o `if (!runAction(id)) continue;` trata o cinza como resposta — **e está
certo**, cinza é resposta. Só que uma ação cinza em *todo* estado que o teste
sabe montar **nunca tem o corpo exercitado**, e o verde entra no relatório com
o nome *"toda ação de arranque"*. Medido: **o nome promete 38; o corpo medido
são 17** — 9 que mudam o arquivo e 8 que dizem por que não.

#### Meu próprio erro, corrigido aqui

Relatei **"22 de 37"** ao Planejador às 00:48. Errado: aquela conta somava as
**seis que terminam numa janela**, e essas ninguém exercita. **Contei como
exercitado o que só foi chamado** — a mesma forma que eu tinha ido medir nos
outros. Chamar não é exercitar, do mesmo jeito que existir não é funcionar.

#### O número escrito caiu duas vezes em seis minutos — e é o argumento dele

| Hora | Ações de arranque |
|:---:|:---|
| 00:48 | 37 |
| 00:52 | **38** — o chat das partículas pôs `novo-emissor` no menu |
| 00:54 | **40** — mais duas, de outro chat |

Ninguém avisou e ninguém errou. **Um `continue` silencioso não teria dito
nada.** Foi o número escrito que contou — em quatro minutos.

**E ensinou que a unidade estava errada.** Prender o *total* faria esta régua
ficar vermelha na suíte dos outros por trabalho que não é defeito nem é deles —
o dano que a regra 24 descreve, e desta vez eu ia causá-lo. Então o que se
prende é a **lista, pelo nome, das que NÃO são exercitadas**: quem acrescenta
uma ação que roda não mexe nela; quem acrescenta uma que fica **cinza** tem de
escrevê-la, que é a hora de alguém olhar. **A afirmação ficou mais forte, não
mais fraca** — e a igualdade é exata de propósito: um subconjunto deixaria
entrar em silêncio a próxima que ninguém exercita.

#### O achado do primeiro dia da régua

Entre 00:48 e 00:55, **cinco ações novas entraram, de dois chats — e as cinco
estão cinzas**, ou seja, ninguém as exercita: `tocar` e `tocar-tras` (do
conserto do `tocar`), `efeito-flash`, `efeito-pulso` e `efeito-tremor`.

São **20 cinzas** hoje, e **13 não são exercitadas em lugar nenhum**. O vermelho
diz o que fazer em vez de só acusar: *dê-lhe o estado de que precisa e exija
efeito, ou escreva o nome na lista — as duas são resposta; deixá-la fora não é.*

#### Uma lista só, e não uma cópia

A lista das que terminam numa janela é **lida do `acoes.test.ts`**, não copiada:
duas listas iguais em dois arquivos divergem. Se ela sumir ou mudar de forma, o
leitor estoura com a frase escrita, em vez de medir uma lista vazia em silêncio.

E elas deixaram de ser **rodadas**: rodar o que não se pode medir não prova
nada, e soltava doze rejeições de um `document` que não existe, sujando a saída
de quem viesse ler o vermelho de verdade.

### v21.5 — A porta que engole o clique, medida: a tecla de espaço não avisa quando a linha do tempo está fechada — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`. Medição às **00:40**, com o
"pode" do Planejador, e **anotada antes de qualquer conserto**. Nada em
`viewport/` nem em `panels/` foi tocado.

#### A régua achou a si mesma primeiro, outra vez

A primeira passada acusou 25, e **três eram inocentes**: o texto de
`ui/actions.ts` que **explica** o registro, o cabeçalho de `ui/keys-dialog.ts`,
e a própria **declaração** de `runAction`.

> **Eu li o texto que fala do código como se fosse o código.**

Terceiro erro da mesma família num dia — instrumento que mede o que não devia.
Conserto: `stripComments`, que troca comentário por espaços do mesmo tamanho
(as linhas continuam valendo) e **pula texto entre aspas inteiro** — sem isso,
uma `//` dentro de um endereço comeria o resto do arquivo e o deixaria limpo
por engano, que é o verde mais perigoso de todos. Dois testes trancam os dois.

**Restaram 22.**

#### O achado: a barra de espaço

| Onde | Ação | |
|:---|:---|:---|
| `viewport/viewport.ts:1471` | **`tocar`**, `where: 'painel'` | apertar e soltar o espaço sem arrastar toca ou pausa. **Com a aba da linha do tempo fechada, o espaço não faz nada e não diz nada** |

**É o único dos 22 com id escrito que pertence a um painel** — o único que a
tabela das ações prova que pode sumir. E é um gesto de todo dia.

**Fora de tudo o que sabíamos:** não estava na pesquisa de 18/09, não estava nos
quatro defeitos de 19/09, e não estava no meu próprio desenho — eu tinha
apontado o menu flutuante e os botões de ícone, e o que apareceu foi **a tecla**.

#### O resto dos 22, cruzado com a tabela das ações

| Grupo | Quantos | O que são |
|:---|:---:|:---|
| existem sempre (`casca`/`arranque`) | 5 | candidatos a exceção. O `duplicar` merece um olho: existe sempre, mas fica **cinza sem seleção**, e aí `runAction` devolve `false` do mesmo jeito |
| `mostrar-painel-*`, escritos hoje | 5 | inofensivos na prática — mas **a régua não consegue prová-lo** |
| id vindo de variável | 10 | a régua vê a queda e não sabe de que ação se trata. Um par de olhos cada. `shell.ts:610` é o menu da barra, e é o primeiro a entrar em `EXEMPT_CALLS` |
| `olha-e-cala` | 1 | `runShortcut`: é o caso da tecla, já decidido |

#### Um buraco de tabela, achado de lado

`mostrar-painel-*` é registrado e **não está no `actions-table.ts`** — e está
certo que não esteja, porque a tabela é das ações de menu. Mas então há **ações
registradas que tabela nenhuma descreve**, e nenhuma régua sabe julgar a
disponibilidade delas.

A lista inteira, com hora e julgamento, em
`documentos/planos/A PORTA QUE ENGOLE O CLIQUE 2026-09-22.md`.

### v21.4 — O defeito 3: chavear no meio de uma curva estragava a curva — 22/09/2026

Pelo `EXECUTANDO · os quatro defeitos do uso`. **Os quatro defeitos de 19 e
21/09 estão fechados.**

**O gesto:** animação `walk`, `t = 0,3`, `Ctrl+K`. O rodapé passava de "Nenhum
aviso" a **2 avisos**:

    curve cx1 0.33 outside [0.25, 0.3], clamped
    curve cx2 0.42 outside [0.3, 0.3], clamped

**A causa:** a chave nova **parte o trecho** 0,25 → 0,5 em dois, e a curva
daquele trecho continuava inteira na chave de 0,25. Os pontos de controle são
**segundos absolutos** (§9.3), e passam a cair fora do trecho novo; o runtime
os aperta contra a borda — **e o movimento muda sem ninguém ter pedido**.

**O conserto: De Casteljau, de 1959.** Partir uma Bézier no parâmetro `s` dá
**duas** Béziers cujo desenho, somado, é o desenho de antes — exato, não
aproximado. O `s` vem do **mesmo** `solveBezierParameter` do runtime: fosse
outro, a chave nova cairia num ponto que a Prévia e o jogo não desenham.

| A curva de trás | O que acontece |
|:---|:---|
| ausente ou `linear` | nada: uma reta partida em duas dá duas retas |
| `stepped` | as **duas** ficam `stepped` |
| Bézier | repartida, componente a componente |
| escrita pelo gesto (`options.curve`) | manda: quem disse qual curva quer não está pondo chave no meio de outra |

### O que o teste prende não é o aviso — é o movimento

O aviso é o sintoma; **a curva redesenhada é o estrago.** O teste amostra a
animação em 201 pontos, de ponta a ponta, antes e depois de chavear, e exige
que batam. Contra o código de antes ele acusa `t = 0.255: 86.0138 contra
86.0051` — quase nove milésimos de diferença num movimento que ninguém mandou
mudar. Mais os casos de `stepped`, de trecho reto, da chave no fim e da curva
escolhida pelo gesto, e a varredura em sete tempos diferentes dentro do trecho.

### E um verde explicável que não provava nada (regra 28)

O relato de 19/09 anotou que *"o `K` sozinho, num osso sem curva ali, não
acusou"*. Medido de novo: continua verdade, e **continua verdade pelo motivo
errado**. O `K` sozinho não era seguro — ele estava sendo usado num osso cuja
linha não tinha curva nenhuma naquele trecho. Com o `hips`, que tem, o `K`
sozinho acusava igual. **A observação passou por outro motivo que não o do
nome dela**, e a anotação dava a entender que a tecla era inocente.

### v21.3 — O defeito 2: "Regra…" e "Pele" fechavam a aba em vez de abri-la — 22/09/2026

Pelo `EXECUTANDO · os quatro defeitos do uso`. Achado **abrindo o programa** em
19/09, com 3.801 verdes na suíte.

**Três estados, medidos na tela**, e o terceiro é o pior porque é **silêncio**:

| A aba Regras | Antes | Agora |
|:---|:---|:---|
| à frente | **a aba FECHAVA** e a janela Nova regra não abria | a aba fica, e a janela abre |
| atrás de outra | funcionava | funciona |
| **fechada** | **nada acontecia, e nada avisava** | a aba volta à frente, e a janela abre |

**A raiz é uma só: duas coisas confundidas numa.** `painel-*` virou INTERRUPTOR
em 13/09 (aberto e à frente = fecha), e quem o chamava queria *"trazer à
frente"*. Agora "trazer à frente" é `mostrar-painel-*`, que **nunca fecha** —
e ele também **reabre** a aba fechada, que é onde a primeira versão deste
conserto ainda morria: a ação existia, rodava, devolvia `true`, e a aba
continuava fechada.

**Três lugares, e o terceiro ninguém tinha visto.** `skins.ts`,
`skins-actions.ts`, e — achado pelo guarda escrito neste mesmo lote —
`dopesheet.ts`, na aba **Curvas**: o item "Curva…" e a ação `interp-curva`
fechavam o painel Curvas de quem pediu para vê-lo.

### O terceiro estado, o do silêncio — e o rótulo que já dizia

As nove ações da aba Regras nasciam no `mount()` do painel. **Com a aba fechada
o painel nunca monta, a ação não existe, e o `runAction` devolve `false` sem
que ninguém olhe o retorno.** Não é "o botão não funciona": é **uma ação que
existe às vezes**, conforme a aba que está aberta. E o silêncio não é descuido
de quem escreveu o aviso — é que **não havia ninguém para avisar**, porque a
coisa que avisaria também não tinha sido montada.

> **O `acoes.test.ts` já exigia o contrário, por escrito:** *"nenhum painel
> registra uma ação de arranque ao montar; cada uma está escrita num
> `*-actions.ts`"*. A tabela chamava as nove de "ação de painel", e o rótulo
> **estava certo: era o defeito escrito na tabela.** Ninguém leu assim.

As nove passaram para `panels/rules-actions.ts`, de arranque, no molde do
`skins-actions.ts` desde o lote A2. O `arranque().length` foi de 28 para **37**.

### E existir não é funcionar

Depois de a ação passar a existir, ela ainda **voltava muda na primeira
linha**: `const doc = this.doc; if (doc === null) return;` — e sem painel
montado não há `this.doc`. O teste pegou: a ação existia, rodava, devolvia
`true`, e a variável não nascia.

> **A forma: dei porta à ação e deixei o corpo dela dependendo da tela.** Um
> teste que só pergunta *"a ação existe?"* teria ficado verde.

**Provado que o defeito existia** (regra 26), dos dois lados: com o registro de
arranque desfeito, `nova-regra-guiada` volta a não existir e a criar variável
nenhuma; com o interruptor de volta em `skins.ts`, o guarda novo acusa o
arquivo pelo nome. Fotos em `backup/fotos-defeitos/lote-3_antes.png` (a aba
Regras **sumida** da tira, e o rodapé *"Regras fechado"*) e `_depois.png` (a
janela Nova regra aberta, com a aba de volta e à frente).

### v21.2 — A porta que engole o clique: a régua escrita e provada, sem medir o programa — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`. **Meia entrega, de
propósito**, e a metade que falta está escrita.

A terceira régua, ao lado das duas de hoje:

| Régua | Pergunta |
|:---|:---|
| `action-audit.ts` | toda **ação registrada** tem porta? |
| `command-audit.ts` | todo **comando** é construído pelo programa? |
| **`call-audit.ts`** | a porta **funciona quando se aperta**? |

> **Todo caminho que chama `runAction` ou fica cinza sozinho, ou olha o `false`
> que ela devolve — e diz alguma coisa. Nenhum caminho aperta e cala.**

`runAction` é honesto: devolve `false` quando ninguém registrou a ação. O
defeito é de quem o chama e **larga a resposta no chão** — e aí o dedo aperta e
o programa cala. Regra 21 na forma pior: ele não improvisa, ele **emudece**, e
quem clicou não sabe se apertou errado, se travou, ou se aquilo nunca existiu.

#### O que mudou o plano: o menu já estava certo

O desenho anunciado era *"item de menu que aponta para ação `needsPanel` e não
fica cinza"*. **Errado**, e achado **lendo, antes de escrever o teste**: a casca
já deixa cinza o item cuja ação ninguém registrou, e a dica diz *"Ainda não
existe neste lote"*.

**A régua escrita daquele jeito nasceria verde, e certificaria o buraco.** Os
que engolem o clique são outros dois, e são onde a expectativa é mais alta —
com o ponteiro em cima da coisa:

| Caminho | Com o `false` |
|:---|:---|
| Menu da barra · Paleta · janela de Atalhos | ficam cinza, ou perguntam e **dizem** |
| Tecla | olha, deixa a tecla livre — **mas cala** |
| **Menu flutuante** (botão direito) | chama e **larga** |
| **Botão de ícone do painel** | chama e **larga** |

A tecla foi decidida pelo Planejador: tecla **que está na `KEY_TABLE`** e cuja
ação não existe **avisa**, dizendo por que e o que fazer; tecla fora da tabela
segue livre e calada. Avisar de toda tecla solta vira ruído, **e ruído ensina a
ignorar aviso**.

#### Provada em código de mentira, e só nele

**Nada foi medido contra `editor/src`.** Outro chat está mexendo em
`shell-actions.ts`, `register-actions.ts` e `panels/rules*` — e os casos
conhecidos desta régua são justamente os que ele conserta: ela nasceria
**verde** por o defeito ter acabado de sair.

> Uma régua que nasce verde porque o defeito acabou de ser consertado é uma
> régua que ninguém viu funcionar.

Como a régua é pura (recebe o texto dos arquivos num mapa), ela se prova
inteira sem tocar no chão de ninguém. Seis testes, todos em código inventado:

| O que prova | Como |
|:---|:---|
| acusa **só quem cala** | quatro arquivos, um por forma: pergunta-e-diz, olha-e-diz, olha-e-cala, larga. Acusa os dois últimos, cada um com o seu tipo |
| **é a FALA que decide** | o mesmo arquivo que passa, sem o `notice`, passa a ser acusado. Sem isto o verde seria explicável e não diria o que o nome dele promete (regra 28) |
| não absolve o guarda torto | perguntar de **uma** ação e rodar **outra** continua sendo acusado |
| acusa o **próximo** | um caminho novo, com o id vindo de variável (`() => runAction(item.acao)`), como o menu flutuante chama |
| perdoa pelo lugar, com motivo | `EXEMPT_CALLS` é `arquivo:linha`, e **envelhece de propósito**: linha que anda volta a ser acusada |
| **não se mede a si mesma** | as três réguas citam `runAction` em texto que as explica. Sem a linha que as tira da varredura, elas se acusariam — a mesma armadilha de hoje, do outro lado: lá dava verde, aqui daria vermelho |

#### O que ela NÃO vê, escrito para não virar palpite

O botão que **já nasce cinza** está certo e ela não o enxerga: ser cinza é
propriedade de um **widget**, não da linha que chama. Essa forma vai para a
lista de exceções com o motivo, em vez de um `if` que adivinha pelo texto e
acerta *quase* sempre — *quase sempre* é como se certifica um buraco.

#### O que falta, e a ordem importa

Rodar contra `editor/src` **com a casa parada**, e anotar a lista **antes** de
qualquer conserto. Se vier vazia, não aceitar o verde. Desenho inteiro em
`documentos/planos/A PORTA QUE ENGOLE O CLIQUE 2026-09-22.md`.

### v21.1 — A paleta deixa de ser segredo, e a dica de um item ligado passa a aparecer — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`. Lote 2 do plano
`documentos/planos/COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`.

**A busca de comandos já existia** desde o item 110: **Ajuda → Paleta de
comandos**, `Ctrl+Shift+P`. Ela ignora acento e filtra por pedaço do nome, e
responde exatamente a pergunta do Humberto — *"eu sei que existe, mas em qual
menu está?"*. **E ele não sabia que existia.** Porta que ninguém encontra é
porta que não conta. Conserto de tela, sem uma linha de busca nova.

| O que mudou | Onde |
|:---|:---|
| A linha do menu ganha **dica na língua de quem está perdido**: *"Sei que existe, mas em qual menu está? Digite parte do nome — sem acento serve"* | `ui/menus.ts` |
| A janela **Ajuda → Atalhos** ganha o botão **"Procurar um comando…"**, e o texto de cima manda apertar nele quando a lista não bastou | `ui/keys-dialog.ts` |
| A linha dos Atalhos no menu avisa que a janela dela também procura | `ui/menus.ts` |

O botão chama `runAction('paleta')`, o **mesmo id** do menu: nenhuma ação nova,
nenhuma tecla nova, nada duplicado. Ele fecha a janela antes de abrir a paleta
— duas modais empilhadas tirariam o `Esc` de dono. E sem a ação registrada ele
**diz onde ela está** em vez de fechar calado (regra 21).

#### O defeito que a FOTO achou, e que nenhum teste acharia

**A `hint` de um item de menu LIGADO nunca chegava à tela.** O `whyDisabled` da
casca só a usava quando o item estava **cinza**; para um item vivo devolvia
`null`, e o `title` caía na linha que escreve só o nome e a tecla.

| Dica | Escrita desde | Aparecia |
|:---|:---|:---|
| "Problemas do arquivo…" | degrau 11, lote 6 (18/09) | **nunca** |
| "Paleta de comandos" | este lote | nunca, até o conserto |

A regra 12 da casa é *"botão sempre com nome na dica"*, e nós a cumpríamos **por
escrito e não na tela** — por semanas. Nenhum teste pegaria: a dica estava lá,
no objeto, escrita certinho.

**Achada indo FOTOGRAFAR a dica nova e não a encontrando.** É a regra do
Humberto, de 21/09, dando o primeiro resultado que ninguém previu:

> **Lote sem foto não fecha — e a foto não serve só para ele ver. Serve para
> NÓS vermos.**

Quatro linhas em `ui/shell.ts`. A tecla continua junto da dica, porque quem lê a
dica duas vezes na mesma semana é quem devia estar usando a tecla.

#### As fotos

`backup/fotos-paleta/` — a janela de Atalhos com o botão, e a paleta que ele
abre, com `pele` digitado e sete comandos na lista. **Não há foto do "antes"**:
o `programa/` foi remontado às 00:10 e o "antes" deixou de ser anterior. O
motivo está nos Desvios, e a régua que fica é *quem remonta o `programa/` tira
de todo mundo a foto do "antes"*.

### v21.0 — O defeito 1: desfazer perdia o osso, e o arquivo ficava inválido — 22/09/2026

Pelo `EXECUTANDO · os quatro defeitos do uso`. **O único dos quatro que deixa o
arquivo inválido**, e o usuário não tem como saber.

**O gesto:** criar osso (`B`) → `Ctrl+D` → desfazer duas vezes. O osso ficava no
arquivo com a pilha de desfazer vazia; refazer criava um gêmeo de mesmo nome e
o validador acusava `duplicate bone name`.

**A forma, e ela é mais funda do que a varredura de 19/09 disse:**

> **Guardei uma CHAVE que o próprio programa pode reescrever.**

Não importa se a chave é uma **referência de objeto** ou um **nome lido do
objeto vivo**: importa se ela é **imutável desde que foi guardada**. As duas
quebram, por caminhos diferentes:

| A chave | Quem a mata |
|:---|:---|
| a referência (`indexOf(this.def)`) | um comando que repõe a lista com **cópias** — todo `SnapshotCommand` faz isso |
| o nome lido do objeto (`this.def.name`) | o `renameEverywhere`, que troca o nome **por dentro do objeto** |

**Isto substitui a receita da varredura de 19/09** (*"trocar `indexOf(objeto)`
por busca por nome"*), que conserta o par que o defeito mostrou e **deixa o par
com renomear de pé**. O conserto certo é copiar o nome para um `string` no
**construtor** e nunca mais lê-lo do objeto vivo.

**Oito lugares consertados**, e só quatro estavam na lista de 19/09:

| Onde | O quê |
|:---|:---|
| `viewport/tools/create-bone.ts` | `CreateBone`, `CreateBoneForSlots`, `CreateBoneAndGrab` |
| `doc/drop-entity.ts` | o slot guardado como objeto virou um `boolean` e o nome |
| `panels/tree-commands.ts` | `AddBone` e `AddSlot` do menu da Árvore, e o `AddSlotWithAttachment` |
| `panels/palette-model.ts` | `DropImageAsSlot` — soltar uma imagem na cena |
| `doc/reparent.ts` | a ordem dos ossos guardada como lista de **objetos** |

**O `reparent.ts` a varredura de 19/09 não apenas deixou de listar: ela o
ABSOLVEU**, numa coluna chamada *"repõe, mas com os mesmos objetos — não é a
forma"*. Uma lista que esquece deixa buraco; **uma lista que absolve faz quem
vem depois não olhar.**

### O que impede a volta: a propriedade da pilha, e não a lista de lugares

**Faz A, faz B, desfaz duas vezes, e o arquivo tem de voltar IGUAL.** Treze
gestos do programa, todos os pares (169 casos), cada um num documento novo.

Esta suíte já provava, desde sempre, que **cada comando sozinho** volta byte a
byte — e os oito defeitos passaram por baixo disso, porque **a forma só aparece
no PAR**. O teste nasceu com **19 pares vermelhos** e fechou com **0**.

Ele achou dois dos oito que nenhuma busca de texto acharia: o `this.def.name`
reescrito pelo renomear, e o `reparent.ts` que a varredura tinha absolvido.
**Isso fecha a discussão sobre ler os 78 `revert(` à mão: não valeria.** Ler
acha o que há hoje; a propriedade acha o que houver sempre — inclusive o que
alguém escrever no ano que vem.

**Provado que os defeitos existiam** (regra 26): cada um dos oito lugares foi
visto vermelho **pelo nome do par** antes de ser encostado, e os que não
acusaram não foram tocados. Fotos em `backup/fotos-defeitos/lote-2_antes.png`
(o aviso laranja `duplicate bone name`) e `_depois.png` (nenhum aviso, um osso
só).

### v20.9 — O vigia que parte do comando: quatorze funções sem botão, com o motivo de cada uma — 22/09/2026

Pelo `EXECUTANDO · o vigia do comando sem porta`. Lote 1 do plano
`documentos/planos/COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`, em cima da
pesquisa de 18/09.

**O buraco:** o `ui/action-audit.ts` parte das **ações registradas** e pergunta
se cada uma tem porta. Um comando que nunca virou ação não é uma ação — e por
isso a auditoria nunca olhava para ele. Ele tem teste verde, o relatório diz
"feito", e não há botão nenhum que o construa. É a regra 28: *"provei o comando"
e "entreguei a função" são coisas diferentes.*

**A régua nova, invertida** (`editor/src/ui/command-audit.ts`):

> Todo `Command` do documento é construído pelo programa — ou está na lista de
> exceções, **com o motivo escrito ao lado**. Sem motivo, o teste fica vermelho.

| O que ela acha | Como |
|:---|:---|
| `class X implements Command` | e também quem **herda** de um comando: o `ImportImagesCommand` é `extends SnapshotCommand`, e uma régua que só olhasse o `implements` não o veria |
| `function x(…): Command` | a fábrica que devolve um comando montado |
| mexida no `.bone` sem chamador | `export function x(file: BoneFile, …)` que **escreve**. É a forma do `removeBodyKey`, o quinto achado da pesquisa |
| `abstract class` | **não** acusa: ninguém a constrói, e é o desenho dela. Quem precisa de porta é a herdeira |

**O que ela achou: quatorze.** Os seis da pesquisa de 18/09, lidos à mão, mais
oito — e as duas contas bateram sem uma olhar para a outra.

| Faltam de verdade | Restos e apelidos | Novos, que a pesquisa não tinha |
|:---|:---|:---|
| `SetRuleChain`, `KeyDriverTarget`, `DeleteTag`, `RenameTag`, `removeBodyKey`, `ImportImagesCommand` | `RemoveBone`, `RemoveSlot`, `RemoveAnimation`, `RenameNode`, `ToggleSkinBone`, `ToggleSkinConstraint` | `removeTimeline` (o irmão singular do `removeTimelines`), `attachmentRows` (código morto) |

**Nenhuma porta foi inventada.** Os seis que faltam de verdade saíram como
exceção, e o motivo de cada um diz `porta ainda não decidida, subida ao
Planejador em 21/09` — quem decide onde entram é o Humberto. `menus.ts`,
`keys.ts` e `actions-table.ts` ficaram intocados.

**O vigia nasceu vermelho, e fica provado que ele acusa** (regra 26). Um teste
que nunca se viu falhar não é um teste: com a lista de dispensados **vazia**,
ele tem de ficar vermelho contra o código de hoje, com os quatorze na cara —
e há um terceiro teste, num código de mentira, que mostra que ele pega o
décimo quinto, o que alguém escrever no ano que vem.

**O primeiro que ele pegou foi ele mesmo**, e a forma do erro vale para o
próximo medidor que alguém escrever: *medi a minha própria tabela junto com o
código que ela julga.* O `EXEMPT_COMMANDS` escreve o nome de cada dispensado, e
mora em `editor/src` — a primeira medição deu **zero comandos sem porta**. Verde
perfeito, e falso: a tabela de exceções servia de menção, e todo comando da
lista passava por "construído pelo programa". **O nome numa lista de exceções
não é uma porta — é a confissão de que não há uma.**

E o segundo buraco apareceu no código de mentira: **herdar não é construir.**
Sem isso, um comando morto ganhava porta por ter uma herdeira igualmente morta.

**A entrega que o Humberto lê**, porque um vigia não tem tela:
`npm run portas` imprime a lista, e `npm run portas -- --gravar` escreve
`documentos/O QUE NAO TEM PORTA 2026-09-22.md` — os números, as que faltam com
o que cada uma faria, as que não precisam com o por quê, e uma seção dizendo
**o que a lista NÃO prova**. Uma régua só: o relatório e o teste chamam o mesmo
`commandsWithoutDoor`.

| Arquivo | O que é |
|:---|:---|
| `editor/src/ui/command-audit.ts` | a régua, a lista de exceções, sem `node:fs` e sem tela |
| `editor/testes/menus.test.ts` | nove testes novos, ao lado do `hiddenFunctions` |
| `ferramentas/provas/comando-sem-porta.ts` | o relatório, por `vite-node` |

### v20.8 — O defeito 4: a pele dizia "ligada" e o personagem não mudava — 21/09/2026

Pelo `EXECUTANDO · os quatro defeitos do uso`. Achado **abrindo o programa**
pelo Planejador em 21/09, com 3.801 verdes na suíte.

**O gesto:** aba Peles, arrastar a `armadura` da coluna Feitas para a coluna
Ativas. O rodapé dizia *"Pele 'armadura' ligada"* e a cena não mudava nada.

**A causa:** soltar no vazio da coluna caía no `stackDrop` com a posição do
fim, ou seja, **no fundo da pilha** — e no fundo a `default`, com 23 desenhos,
cobre os 3 da armadura. A §4.4 estava sendo obedecida à risca; o gesto é que
mirava o lugar errado.

| O que mudou | Como ficou |
|:---|:---|
| Soltar na **coluna** Ativas | põe **no topo** (`stackAddOnTop`), que é o que o painel Exibição sempre fez |
| Soltar numa **linha**, ou na faixa "embaixo de todas" | inalterado: aquele é o gesto de ordenar, e ele é útil |
| A frase do rodapé | diz **o que aconteceu de verdade** (regra 21): "ligada, mas nada dela aparece na cena: os 3 lugares que ela veste estão cobertos por "default", que está por cima. Arraste-a para o topo da coluna Ativas" |

**A decisão saiu do `addEventListener` e foi para o módulo puro** (regra 8):
`dropOnColumn` e `dropAt`, em `panels/skins-model.ts`. O defeito atravessou
3.801 verdes justamente por morar num ouvinte de evento, onde nenhum teste
sem navegador alcança.

**Dizer a verdade exigiu resolver a §4.4 no editor**: `skinShowing` monta a
lista de resolução (cada pele da pilha, de baixo para cima, com os `includes`
expandidos antes dela) e, por par `slot/placeholder`, a última ganha.

**E o `null` conta.** A primeira versão desta conta olhava só os desenhos e
teria dito *"nada dela aparece"* da `armadura_capa`, que só tem `hair: null` —
o elmo tapando o cabelo. **Esconder também é um efeito**, e contá-lo fora era a
mesma mentira deste lote, virada do avesso.

**Provado que o defeito existia** (regra 26): com o `dropOnColumn` de volta ao
jeito antigo, dois dos testes novos ficam vermelhos. E o par de fotos, com o
gesto de arrastar disparado de verdade na página, está em
`backup/fotos-defeitos/lote-1_antes.png` e `_depois.png`.

### v20.6 — Degrau 12, parte `P1`: a linha que diz onde cada caso mora, e por que o P-002 voltou — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, por decisão do Planejador depois do
achado da v20.4. O P-002 voltou para `casos-pendentes/`, e o número da suíte
passou a ser honesto: **`P: 16/16`**, e não `17/17`.

**O teste passou a afirmar ONDE cada caso mora**, que é o contrário de um
detalhe: `casos/` é o que a suíte oficial varre, `casos-pendentes/` é o que ela
não varre. Um caso na pasta errada ou não é provado, ou é **contado como prova
sem ser uma** — que foi exatamente o que aconteceu. A leitura resolve as duas
pastas, e três listas dizem o que se espera: `TODOS` (dezessete), `PROVADOS`
(dezesseis, em `casos/`) e `MUDOS` (o P-002, em `casos-pendentes/`).

**A linha nos dezesseis**, na convenção que os casos `C-*` já usavam — quem move
escreve quando e por quê. Com um acréscimo que os `C-*` não tinham: o
`esperado.json` destes teve **três** fontes independentes, e não duas — a
implementação de referência que escreveu o caso, o runtime TypeScript e o
Python.

**E no P-002, o contrário, com data e motivo:**

> Este caso esteve em `casos/` por engano, em 18/09/2026, e foi devolvido no
> mesmo dia. O anexo tem `rate: 0`, a prova dele está numa timeline de `rate`
> que é 2ª fase, e o `esperado.json` traz uma lista vazia de propósito — então
> um runtime de 1ª fase produz zero partículas, bate com a lista vazia e
> **passa**. **Passar não é provar.**

O leiame dele diz agora **o que precisa acontecer para ele subir**: o ramo
`linear` da §4.2 em serviço, `rate` animável, e o `esperado.json` preenchido com
a conta que ele já traz. A razão de escrever isso, e ela é do Planejador: **um
caso que já foi promovido uma vez por engano é candidato a ser promovido de novo
pelo mesmo engano.**

A §14 da spec ganhou o número certo e a história curta: dezesseis entraram, o
P-002 não, e **quem o mover antes da 2ª fase repõe o número que mente**.

Conformidade **87/87**, `P: 16/16` · `tsc` limpo · validador aprova os 17
`entrada.bone` nas duas pastas · `particulas.test.ts` **220** e
`rig-no-validador.test.ts` **32** · suíte **3.801** com **1** vermelho, o antigo
do manual.

### v20.5 — Degrau 12, parte `P2`: o P-002 volta, e o teste deixa de prender o lugar — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime TS`. O P-002 voltou de `casos/` para
`casos-pendentes/`, e os dois arquivos de teste deste chat passam a procurar um
caso **nos dois lugares**.

#### Por que o P-002 voltou, e por que isso é mais fino do que "ele não prova nada"

Ele **passa sem exercitar o que o nome dele promete.** O anexo tem `rate: 0`, a
prova dele está numa timeline de `rate` que nenhum runtime de 1ª fase
implementa, e o `esperado.json` traz lista vazia de propósito — então um runtime
de 1ª fase produz zero partículas e passa.

**Ele não é mudo:** prende a regra da §14.1 — emissor sem ninguém vivo sai como
lista **vazia** e não some da chave. Um leitor sem o módulo P não escreve a
chave `fx/jato` e o comparador acusa `<emissor ausente>`.

Mas não é isso que o nome dele diz. **Um caso mudo não engana ninguém** — vê-se
a lista vazia e desconfia-se. **Um caso que passa por outro motivo que não o do
nome dele engana**, porque quem lê *"P-002 taxa em rampa: passou"* conclui que a
inversa estável da integral está coberta. O nome mente, e o nome é o que se lê
num relatório de 88 linhas.

#### O erro de forma, nomeado pela segunda vez

O guarda da numeração dizia *"os casos P vivem em `casos/`, em sequência e sem
buraco"* — e quebrou no dia em que um caso mudou de pasta por decisão legítima.

**A propriedade que ele quer prender — nada sumiu — é verdadeira sobre o
CONJUNTO das duas pastas, nunca sobre uma delas.** O teste amarrou o LUGAR em
vez da PROPRIEDADE. Agora varre as duas juntas, e um caso pode mudar de pasta
sem derrubar nada; o que não pode é o `P-00i` sumir dos dois lugares.

O teste da pasta pendente virou o contrário do que era: em vez de *"está
vazia"*, afirma que ela guarda **exatamente o P-002**, com o motivo escrito —
guarda de que ninguém o promova de novo por engano.

#### A varredura que a regra 25 manda, e o que ela achou

Antes de dizer que estava feito, varri **todos** os leitores das duas pastas —
inclusive os que não são deste chat. Achou um vermelho a mais, em
`runtime/testes/particulas.test.ts`, que lia o `esperado.json` do P-002 na pasta
antiga. O arquivo do chat do formato já procurava nos dois lugares e sobreviveu
sem tocar em nada.

É a mesma varredura que, mais cedo hoje, este chat deixou de fazer — e que
custou 139 vermelhos descobertos tarde.

### v20.4 — Degrau 12, parte `P1`: os testes seguem os casos — e o P-002 passa sem provar nada — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`. Os dezessete casos de partícula
entraram em `conformidade/casos/` e `particulas.test.ts` ainda os lia em
`casos-pendentes/`: **139 vermelhos**, todos por uma linha de caminho.

**O conserto foi uma linha**, e o guarda ficou de pé: o teste que afirma que o
executor **não varre** `casos-pendentes/` continua valendo — é ele que impede
alguém de pôr caso não confrontado na varredura oficial, e ele tem de valer
**com a pasta vazia**. A constante mudou de nome junto (`pendentes` passou a
mentir).

**E a varredura achou duas coisas que a mudança tornou falsas.**

**A primeira, na spec:** a §14 dizia que "os oito casos vivem em
`casos-pendentes/`". São dezessete e vivem em `casos/`. Reescrita, com a regra
que de facto valeu: **um caso só entra quando três fontes independentes dão o
mesmo número** — a implementação de referência que o escreveu, o runtime
TypeScript e o Python.

**A segunda é séria, e é defeito de desenho meu.**

> **O P-002 passa sem exercitar nada.**

Ele é o único de **2ª fase**. O anexo tem `rate: 0`, a prova dele está numa
timeline de `rate` que nenhum runtime de 1ª fase implementa, e o
`esperado.json` traz uma lista **vazia** de propósito. Então um runtime de 1ª
fase produz zero partículas, bate com a lista vazia e **passa**.

Enquanto a 2ª fase não abrir, **`P: 17/17` quer dizer dezesseis provas e um caso
mudo.** É a terceira cara da regra 21 da casa — *a prova dizendo que está tudo
bem quando não olhou* —, e desta vez quem a produziu foi o desenho do caso, não
o código.

E o leiame dele diz, em maiúsculas, **"Não mova este caso para `casos/` antes
disso"** — e ele foi movido. A ressalva está agora escrita na §14 e presa por
teste, para ninguém ler o `17/17` como dezessete. **A recomendação — devolver o
P-002 a `casos-pendentes/` até a 2ª fase abrir — é do Planejador, e foi subida a
ele:** quem move os casos é ele, e o executor não move.

Suíte **3.784**: de 140 vermelhos para **1** — o antigo do manual, do degrau 13,
que não é de ninguém desta rodada. Conformidade **88/88**, `P: 17/17` ·
`tsc` limpo · `particulas.test.ts` **203** e `rig-no-validador.test.ts` **32**.

### v20.3 — Degrau 12, parte `P2`: os testes seguem os casos para `casos/` — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime TS`. Os dezessete casos P saíram de
`conformidade/casos-pendentes/` e entraram em `conformidade/casos/` (v20.2), e
os dois arquivos de teste deste chat liam a pasta antiga — **174 vermelhos de um
golpe**, todos de caminho.

| Arquivo | O que mudou |
|:---|:---|
| `runtime/testes/particulas.test.ts` | lê `conformidade/casos/` |
| `ferramentas/testes/medida-particulas.test.ts` | o mesmo, e o teste de contagem |

**O teste de contagem trocou de propriedade, não de número.** Ele dizia "são
oito casos". Agora diz que a numeração **não tem buraco** — o caso `i` chama-se
`P-00i` — e que são pelo menos dezessete. Trocar `8` por `17` teria consertado o
sintoma e mantido o guarda cego: um caso que suma sem ninguém notar é justamente
o que a numeração existe para impedir, e o teste velho não pegava isso.

Entra também um guarda novo: **`casos-pendentes/` ficou vazia de casos P.**
Enquanto um caso mora ali, o executor não o varre e um leitor sem o módulo P
continua verde — se um voltar para lá sem que ninguém diga, o teste avisa.

#### Duas lições de método, e nenhuma é sobre partículas

**Quando uma pasta muda de lugar, varra TODOS os leitores dela antes de dizer
que está feito — mesmo os que não são seus, não para consertar, para AVISAR.**
A cerca protege de dois chats escreverem no mesmo arquivo; ela não protege de um
chat mudar o chão debaixo do outro. Avisar é a parte que atravessa a cerca sem
quebrá-la.

**Número de suíte tem hora.** O relatório anterior deste chat dizia "1 vermelho,
número limpo", e estava certo **naquele minuto**: a medição foi tirada antes de
os casos se moverem. O número chegou velho na mão de quem o leu sem que ninguém
tivesse feito nada errado. Uma medida tem validade, e ela **expira quando alguma
coisa se move entre a medição e o relatório**.

### v20.7 — O degrau 12 fechou: partículas, biblioteca e as portas do formato — 18/09/2026

Fecho da rodada pelo `PLANEJADOR · dd3937`, com os cinco chats parados e a casa
vazia. **Medido pelo Planejador, não somado dos relatórios.**

| Prova | Resultado |
|:---|:---|
| `npx vitest run` | **3.801** · 3.771 verdes · 29 pulados · **1 vermelho** |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| Conformidade, nos **dois** runtimes | **87 de 87** — `A 13 · B 7 · BIN 1 · C 44 · P 16 · X 5 · ZIP 1` |
| `npm run roteiro` | **14 de 14** |

**O 1 vermelho é o `exportar-e-ajuda.test.ts`, de 15/09**, que espera nomes de
capítulo velhos. É do **manual**, degrau 13, e continua sem dono até o Humberto
pedir o manual.

**O que entrou**, em dezoito versões (v17.0 a v20.6):

| Parte | |
|:---|:---|
| **Partículas** | A extensão `BONE_particles`, 1ª fase, nos **dois** runtimes — escritos ao mesmo tempo, **sem um olhar o outro** |
| **Biblioteca** | Exportar e Importar animação, e as quatro de fábrica contra o `humanoide-v1` |
| **Portas** | Sliders · áudio de eventos · física com **Assar em chaves** · variáveis e etiquetas |
| **Provas** | A conformidade passou de **71 para 87 casos**; a medição de painel passou a medir **com uma regra escolhida** |

**Doze pontos cegos** foram achados num texto de 35 KB escrito com cuidado, e
**nenhum aparecia em teste nenhum**. Um deles — a §4.2 somando o `startDelay` no
fim em vez de deslocar a origem — **reprovou os dois runtimes**, que estavam
certos: a spec é que estava errada, e a ordem que a produziu foi do Planejador.
O confronto inteiro está em
`documentos/planos/CONFRONTO dos dois runtimes - particulas 2026-09-18.md`.

**O P-002 não entrou em `casos/`, de propósito.** Ele passa sem exercitar o que
o nome dele diz: a prova está numa timeline de `rate` que a 1ª fase não
implementa, e a lista esperada é vazia. Fica em `casos-pendentes/` até a 2ª fase
abrir. `P: 16/16` são dezesseis provas, e não dezessete.

**Cinco regras novas no `CLAUDE.md`** (24 a 28), todas nascidas de erro medido
neste dia, e três delas melhoradas por quem as recebeu.

---

### v20.1 — Degrau 12, parte `P1`: a origem da emissão, e a frase bem escrita que estava errada — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, por decisão do Planejador, sobre
achado dos **dois** runtimes. Quatro coisas num lote: a §4.2 consertada, o P-016
regerado, o P-017 novo, e o conserto de entrada do P-010 e do P-011.

---

**1. A §4.2 estava errada, e a frase era minha.**

A v19.2 escreveu `t_cont = startDelay + t_k + τ(i − E_k)` — o `startDelay`
somado **no fim**, com a integral correndo desde `0`. Isso **não é** deslocar a
origem, e contradizia, dentro do mesmo documento, o que o confronto já tinha
fixado e os dois runtimes tinham lido igual sem se falarem.

A consequência, medida: com `startDelay 0.3`, `rate 20` e uma chave de
`emitting` fechando em `0.5`, nasciam partículas em `0.5`, `0.55`, `0.6`, `0.65`,
`0.7` e `0.75` — **seis delas com o `emitting` já fechado no relógio do
esqueleto**, que é o relógio que a §4.1 nomeia como o que vale. O animador fecha
a torneira em `0.5`, vê a chave parada onde a pôs, e o efeito continua nascendo
até `0.75`. É o defeito que a própria §4.1 existe para evitar.

A redação que ficou:

> A origem da emissão é `o = startDelay`. A integral `E` corre **no relógio do
> esqueleto**, a partir de `o`, com `emitting(t)` lido em `t` sem desconto:
> `E(o) = 0`. O nascimento do índice `i` é o instante `t_cont` em que
> `E(t_cont) = i` — a **inversa da integral**, não uma soma aplicada depois.

E, porque a forma sozinha foi o que causou o erro, ficou escrito **por que as
três expressões do `startDelay` não têm a mesma forma**: na §4.2 ele é a origem
de uma **integral**; na §4.3 e na §6 ele é somado a um instante **escrito pelo
autor**, e ali somar É deslocar. Sem essa tabela, o próximo leitor "uniformiza"
as três e traz o defeito de volta.

A §4.4 ganhou uma frase junto: `taxa_local` é lida em `t_cont` **sem desconto**,
porque com a origem no lugar certo o `t_cont` já é do relógio do esqueleto. A
dúvida que o runtime TypeScript levantou era legítima **na redação velha**, onde
`t_cont` ficava em dois relógios ao mesmo tempo; com o conserto ela deixa de
existir.

**A lição, e ela é do Planejador:** a ordem foi *"escreva por extenso"* sem dizer
**o que** a expressão devia significar. **Uma ordem de forma sem a semântica
junto produz uma frase bem escrita e errada** — e ela passou por ele, por mim e
pelos dois runtimes até um caso separá-la.

---

**2. O P-016 foi regerado, e agora bate com os dois runtimes.**

De 10 nascimentos (`0.3` a `0.75`) para **4** (`0.3`, `0.35`, `0.40`, `0.45`) —
que é o que o TypeScript e o Python deram, cada um por seu lado. O leiame guarda
as **duas** leituras erradas, e a segunda é a que esteve na spec: é a melhor
explicação de por que a linha existe.

---

**3. P-017, o `emitting` que RELIGA — e ele mede identidade, não contagem.**

Um trecho de taxa zero tem área zero e **não consome índice**. Com `rate 20`,
ligado em `[0, 0.5)`, desligado em `[0.5, 0.8)` e ligado de novo a partir de
`0.8`, a partícula que nasce em `0.80` é o índice **10**, e não o **16**.

| | Índices em `t = 0.99` | Em `t = 1.00` |
|:---|:---|:---|
| **Pela spec** | `0..9` e **`10, 11, 12, 13`** | mais o **`14`** |
| Pela conta errada | `0..9` e **`16, 17, 18, 19`** | mais o **`20`** |

**A contagem é a mesma nas duas** — 14 e 15 dos dois lados. Só os **nomes**
mudam. E índice é `hash` (§3.2), logo vida, velocidade, ângulo e cor: **a mesma
partícula com dois nomes desenha duas coisas**, sem nenhum número denunciá-lo.
Um caso que conferisse o tamanho da lista passaria os dois — por isso este mede
**índice a índice**.

A segunda amostra pina a fronteira `t_i <= t`: a de índice `14` nasce
**exatamente em `t = 1.0`** e está viva, com idade `0`. Não é regra nova — o
P-001 e o P-005 já a exercitam — mas aqui cai num número redondo. **Contar de
cabeça erra aqui, e errou:** a primeira estimativa foi 14, feita sem rodar, e o
próprio runtime que a fez corrigiu para 15 depois de medir.

---

**4. O P-010 e o P-011 não tinham a animação que o laço exige.**

O P-011 foi achado pelo runtime Python: os dois afirmavam `D = 1` no leiame e
**não traziam `animations`** na entrada. A §6 diz que `D` é a duração da
animação que toca — sem ela não há `D`, e sem `D` não há volta de trás. O
runtime devolvia lista vazia em `t = 0.05` **e estava certo**.

A varredura que isso me fez fazer achou o **P-010** com a mesma omissão, que
ninguém tinha visto. Consertadas a **entrada e a sonda**, nunca o esperado: os
números não mudaram, só o arquivo passou a dizer de onde vem o `D` que a conta
já usava.

**E a peneira ganhou o que lhe faltava.** Os erros que eu tinha pegado sozinho
eram de **contagem**, e a conta à mão os pegava. Este era de outra natureza —
**a entrada não tinha o que o leiame afirmava que ela tinha** —, e nenhuma
conferência de tamanho o acharia. Entraram três testes que varrem os dezessete:
sonda em laço exige animação; o `D` que o leiame afirma tem de existir na
entrada com essa duração; e todo campo que o bloco `json` do leiame cita tem de
estar mesmo no emissor, com o mesmo valor.

Conformidade **71/71** · `tsc` limpo · validador aprova os **17**
`entrada.bone` · `particulas.test.ts` **202**, todos verdes.

### v19.8 — Degrau 12, parte `P1`: `oldestInFront` é o `reverse()` da lista inteira — e o corte vem antes — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, por decisão do Planejador. A **décima**
frase calada da spec da extensão, levantada ao escrever o P-014.

**A decisão:** `oldestInFront` **inverte a lista inteira**. O desempate vai
junto — `(t_i, fluxo, índice)` inverte nos **três**. Não é uma ordenação nova
com critérios próprios. Em símbolos, como a fronteira `[0, D)`:

```
oldestInFront = reverse(youngestInFront)
```

*"In front"* diz **de que ponta a lista começa**, e mais nada. Se só o `t_i`
invertesse e o `fluxo` continuasse crescente, duas partículas nascidas no
**mesmo instante** trocariam de lugar entre os dois modos sem motivo nenhum.

**E escrever essa linha me fez achar um erro na minha própria calculadora de
referência** — o que rendeu a linha irmã, que ninguém tinha pedido:

> **São duas etapas, e a ordem entre elas é normativa.**
> `1. cortar: as maxParticles MAIS NOVAS` (§7.1, sempre) ·
> `2. ordenar: a ordem de desenho do sortMode` (§9.9)

Eu invertia e **só então** cortava. Isso guardaria as **mais velhas** — o
contrário do que a §7.1 manda. O defeito é **latente**: só aparece quando
`oldestInFront` e um `maxParticles` apertado andam juntos, que é exatamente o
par que nenhum dos dezesseis casos tem. O P-014 não tem teto e o P-005 usa o
`sortMode` padrão, então **nenhum número gravado mudou** — conferido regerando
os oito e comparando.

É a mesma família das outras nove: um ponto que nenhum caso exercita, onde dois
leitores atentos fariam coisas diferentes. Só que desta vez o leitor atento que
errou fui eu, e o que o pegou foi escrever a regra por extenso em vez de
assumir que eu já a seguia.

Há teste que mede o defeito com números: doze vivas, teto de `5`, e as duas
ordens de operação dão **conjuntos diferentes** — `[7, 8, 9, 10, 11]` contra
`[0, 1, 2, 3, 4]` —, não só ordens diferentes.

O P-014 continua valendo: ele prova o campo com **um fluxo só**, de propósito,
porque foi escrito **antes** desta linha. Não dependia dela, e não depende
agora.

Conformidade **71/71** · `tsc` limpo · `particulas.test.ts` **142**, todos
verdes · nenhum `esperado.json` alterado.

### v19.7 — Degrau 12, parte `P1`: os oito casos novos, um por decisão da rodada — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`. **P-009 a P-016**, em
`conformidade/casos-pendentes/`. O executor continua dizendo **71 de 71**: ele
não varre essa pasta.

**A régua que decidiu a lista:** toda decisão desta rodada foi tomada num ponto
que **nenhum dos oito primeiros casos exercita**. Os dois runtimes passavam os
oito e desenhariam coisas diferentes na mão de quem usasse. Cada caso fecha um
desses pontos.

| Caso | O que prende | Por que nenhum dos oito o separava |
|:---|:---|:---|
| **P-009** | `startDelay` com `prewarm`: a origem desloca, e o pré-aquecimento parte dela. 25 partículas, de `i = −20` a `4`, a mais velha em `−0.7` | os oito têm `startDelay: 0` |
| **P-010** | `startDelay` com rajada, **mudando quem o laço corta**: três ciclos escritos, **dois** sobrevivem | idem |
| **P-011** | Rajada com laço: em `t = 0.05` a tela **não** está vazia — a explosão da volta anterior está lá — e dos três ciclos só o de `0.8` passa no corte | o P-007, o único com rajada, tem `looping: false` |
| **P-012** | `spherizeDirection 0.5` com `spread 30`: **6 das 7** partículas mudam de lugar | com `spherize: 0` as duas ordens coincidem |
| **P-013** | Osso com `scaleX 2`, `scaleY 3`: o `scale` do dump é **`2`** — `hypot(a, c)` —, e não `2.5` (a média), nem `3` (o de Y), nem `2.449…` (a raiz do determinante) | nos oito a escala do osso é `1`, e as quatro leituras coincidem |
| **P-014** | `oldestInFront`: os mesmos doze números, na ordem inversa | os oito usam o padrão |
| **P-015** | Malha `edge` e `triangle`, a fórmula de **dobrar**, e **a mesma triangulação escrita noutra ordem exigindo a mesma aresta** | nenhum caso usa `shape: "mesh"` fora de `vertex` |
| **P-016** | Chave de `emitting` com `startDelay`: dez nascimentos, de `0.3` a `0.75`. Pela leitura errada sairiam de `0.6` a `1.05` — **mesma quantidade, instantes todos diferentes** | idem |

**O coração do P-015** é o par `fx`/`fx2`: duas malhas iguais com `triangles`
escrito em ordens diferentes e com os índices rodados, que **têm de dar posições
idênticas**. Um runtime que guarde a ordem de descoberta das arestas escolhe
outra para o mesmo `u12` — e **sem esse par ninguém notaria**, porque cada lista
sozinha "parece" certa. O gerador tem um `throw` que falha se as duas
divergirem.

**Estes oito pedem TRÊS acordos, não dois.** O `esperado.json` de cada um saiu
de uma implementação de referência escrita só pela spec — a mesma que reproduz o
P-001 número a número, conferido antes de gerar qualquer coisa. Os dois runtimes
rodam depois. Se os três baterem, o caso entra; se dois baterem e um não, o
errado se conserta; **se os três discordarem, a spec ainda está calada ali**, e
isso sobe antes de qualquer conserto.

**Cada leiame diz, em uma linha, qual decisão o caso prende e o que aconteceria
sem ela** — é o que impede alguém, daqui a um ano, de "simplificar" o caso sem
saber o que está apagando. Há teste que exige essa seção nos oito.

**Dois erros meus, achados por conferir em vez de supor.** Na primeira geração o
P-009 saiu com 5 partículas em vez de 25 (a calculadora cortava os índices
negativos do `prewarm`) e o P-016 com 15 em vez de 10 (eu não limitava os
nascimentos ao fim do trecho de emissão). Os dois foram achados comparando o
número gerado com a conta feita à mão **antes** de gerar. Se eu tivesse escrito
o leiame a partir do número em vez do contrário, os dois teriam passado.

**Dois testes foram reescritos, não apagados:** o que listava "os oito" casos e
o que afirmava que nenhum exercita o `startDelay`. Os dois diziam a verdade até
esta leva existir; agora dizem a verdade nova, e o segundo nomeia **quais** dos
novos o exercitam.

Conformidade **71/71** · `tsc` limpo · validador aprova os **16** `entrada.bone`
· `particulas.test.ts` **139**, todos verdes.

### v19.6 — Degrau 12, parte `C`: a barra das Regras aperta, e a aba volta a caber — 18/09/2026

Pelo `EXECUTANDO · as portas do formato`, depois da medição do fecho.

A aba **Regras** passou a **rolar em 1280×720, faltando 10 px**, e a culpa é
toda da barra: com os quatro botões novos da física (lote 3) e os quatro das
variáveis e etiquetas (lote 4) ela foi a **doze**, quebrou em quatro linhas e
tomou **215 px de um painel de 226** — sobravam 11 px para a lista.

| | Antes | Depois |
|:---|---:|---:|
| A barra, em 1280×720 | 215 px | **137 px** |
| O que a aba passa da coluna | 10 px | **0** |
| O botão (altura × largura) | 41 × 53 px | 34 × 38 px |

**A saída não foi tirar botão nem encurtar nome.** A régua do Humberto é que
ícone sozinho não se lê, e esconder função para ganhar número seria o oposto do
que este degrau inteiro fez. A saída é o **recheio**, e ela já tinha precedente
nesta casa: a barra da Árvore fez o mesmo no lote dela, pelo mesmo motivo
(*"sete controles, quatro linhas, 127 px de faixa"*), e os valores aqui são os
de lá. O alvo do clique ficou em **36 px de altura** — acima dos 30 da Árvore.

Nenhum botão saiu, nenhum nome encurtou, nenhuma dica mudou. Só
`editor/src/panels/rules.css`, e a regra é escopada a `.regras .painel-barra`:
nenhuma outra barra do programa muda.

**Propriedades piorou 25 px** nas duas telas (265 → 290 e 387 → 412), e isso é
esperado: ela ganhou a ficha do parâmetro, a da variável, os grupos de alvo do
Comando e a da definição do evento. Não foi mexida — é limite conhecido e
escrito desde 13/09, e o que fazer com ela é decisão do Humberto.

### v19.5 — Degrau 12, parte `P1`: o relógio do `emitting`, e a régua que ela dá — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, por decisão do Planejador. A **nona**
frase calada da spec da extensão, e ela veio da oitava: quando o `startDelay`
entrou nas contas (v19.2), ficou a pergunta de em que relógio a timeline é lida.

**A decisão:** a timeline de `emitting` é lida no **relógio do esqueleto** — o
mesmo em que o animador pôs a chave —, e **não** em `t − startDelay`.

**A régua geral, e é ela que vale mais que a decisão:**

> **O `startDelay` desloca NASCIMENTOS, que o programa gera. Não desloca CHAVES,
> que uma pessoa põe à mão na linha do tempo.**

| Segue o `startDelay` | Não segue |
|:---|:---|
| Os nascimentos do fluxo contínuo (§4.2) | A timeline de `emitting` |
| Os ciclos de uma rajada (§4.3) | Qualquer timeline de campo animável |
| A janela do `prewarm` (§6), a partir da origem deslocada | |

**Por quê.** Se a timeline fosse lida no relógio do emissor, mudar o
`startDelay` de `0` para `0.3` faria **todas as chaves de `emitting` andarem
0,3 s sem se moverem na tela**: o animador veria a chave parada onde a pôs e o
efeito acontecendo noutro instante. É o programa fazendo uma coisa e mostrando
outra — o que a regra 21 do projeto proíbe.

A distinção ficou escrita **junto da decisão**, e não só a decisão, porque é ela
que explica de uma vez por que o `prewarm` e a rajada seguem o `startDelay` — são
nascimentos, gerados pela conta — e a timeline não — é controle, posto à mão.
**Quem acrescentar o próximo campo animável já tem a resposta**, e a décima frase
calada não precisa existir.

Com `startDelay: 0` as duas leituras coincidem, e é o caso dos oito de hoje:
nenhum os separa. Continua valendo o teste que cai se um caso novo mudar essa
cobertura.

Conformidade **71/71** · `tsc` limpo · validador `--todos` sem erro ·
`particulas.test.ts` **99**, todos verdes.

### v19.3 — Degrau 12, parte `C`, lote 4: variáveis e etiquetas, com o jeito de desligar — 18/09/2026

Pelo `EXECUTANDO · as portas do formato`. **Porta G9/P15**, a última das cinco.

> 🗣️ *"Variáveis e tags pela tela, provavelmente — **com um jeito de
> desligar**"* — o Humberto, RESPOSTAS Q23, 17/09/2026.

O formato tinha as duas desde sempre: a `Variable` na §8.4, as tags na §8.5, as
timelines das duas na §9.9. O runtime lia e expunha. E a `editor/src/anim/keying.ts`
**já sabia** os dois alvos (`variableTarget`, `tagTarget`). Só que **nenhum
comando criava** uma variável ou uma etiqueta, e não havia painel: o formato
sabia, o editor sabia chavear, e não havia por onde declarar nem por onde ver.

Arquivo novo: `editor/src/panels/rules-vars.ts`. Cinco ids novos, dois submenus
no Esqueleto (Física e Variáveis e etiquetas), e o `showVars` em `RECORTE_prefs`.

| O quê | Onde |
|:---|:---|
| A lista de **variáveis** na aba Regras: tipo, valor, e quais animações a chaveiam | `panels/rules.ts` |
| A **ficha** da variável em Propriedades: nome, tipo, e o valor **na forma do tipo** (número, texto ou caixa) | `panels/properties-model.ts` |
| A lista de **etiquetas**, com as **duas metades** da §8.5 separadas | `panels/rules.ts` |
| Criar, renomear e apagar as duas, arrastando as chaves junto | `panels/rules-vars.ts` |
| O **jeito de desligar** (Q23) | `ui/prefs.ts`, `panels/rules-vars.ts` |
| `Selection.variables`, opcional como `parameters` | `contract.ts` |

**O desligar não esconde em silêncio.** Um interruptor que faz a coisa sumir sem
dizer que ela existe é o defeito que a Janela de Problemas consertou no degrau
11 — e aqui seria pior, porque o jogo continuaria lendo a variável que a tela
escondeu. Desligada, a seção ocupa **uma linha** que diz que está desligada e,
quando o arquivo tem alguma, **quantas**: *"Variáveis e etiquetas: desligadas —
este arquivo tem 2 variáveis e 3 etiquetas, escondidas aqui. Ligue para ver."*
Tem teste, e tem teste da singular.

**"Etiqueta", e não "marca".** *"Marca"* já era outra coisa no editor: o
marcador da linha do tempo, do menu Animação → Marcas, tecla `M`, id
`nova-marca`. Duas coisas diferentes com o mesmo nome fazem procurar no lugar
errado. O `tag` da §8.5 é o nome **novo** na tela, então quem troca é ele —
inclusive o rótulo da timeline em `anim/keying.ts`, que dizia "Marcas".
**É palavra de tela, e a palavra final é do Humberto**: está anotado nos
Desvios para ele decidir.

**As duas metades da §8.5, separadas.** A spec diz que o jogo lê
`animation.tags ∪ valor da última chave <= time`. São caminhos diferentes — um
vale a animação inteira, o outro vale daquele instante em diante —, e juntá-los
num interruptor só faria a tela mentir sobre qual dos dois foi escrito. Cada
etiqueta tem os dois, com o nome inteiro na dica, e a lista mostra por extenso
**o que o jogo lê agora**, que é a união.

**Onde o programa não entende, ele avisa** (regra 21): tipo que não é um dos
quatro da §8.4, padrão que não bate com o tipo (L1), variável que nenhuma
animação chaveia, etiqueta que nenhuma animação usa, e a recusa falada de
chavear etiqueta com a base aberta. Trocar o **tipo** leva o padrão junto: um
`default: 0` dentro de uma variável "Sim ou não" é L1, e seria o nosso próprio
editor escrevendo um arquivo que o runtime recusa. Apagar uma etiqueta tira o
nome dela de toda animação e de toda chave — §8.5 diz que tag usada e não
declarada é L2, e apagar só a declaração criaria um aviso que a nossa tela
teria causado.

**Os três programas** (regra do Humberto): o **Spriter** tem variáveis (da
entidade e do objeto) com linha própria na linha do tempo — é o modelo que a
§8.4 cita pelo nome (*"varline do Spriter"*) — e não tem tags; o **Spine** não
tem nenhuma das duas (o que chega perto são os eventos com `int`/`float`/`string`,
que já temos); o **DragonBones** não tem nenhuma das duas. Seguimos o Spriter na
variável; nas etiquetas nenhum dos três serve, e aí vale o pedido dele à letra.

### v19.2 — Degrau 12, parte `P1`: o `startDelay` vale para a rajada, e estava fora de todas as contas — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, por decisão do Planejador. A oitava
frase calada da spec da extensão, achada pelo chat do runtime Python ao conferir
o corte de ciclos da v18.8.

**A pergunta:** o `startDelay` vale para a rajada? A §4.3 escrevia
`t_i = time + c·interval`, **sem** ele. A §9.1 dizia *"nascimentos só a partir
daqui"*, sem dizer de qual fluxo. E o corte novo da §6 escrevia
`0 <= time + c·interval < D`, também sem ele.

**A resposta: vale.** `startDelay` é propriedade do **emissor inteiro**, não de
um fluxo. Duas razões, e as duas são coerência com o que esta rodada já decidiu:

| | |
|:---|:---|
| 1 | O confronto já fixou que o `startDelay` **desloca a origem** da emissão — foi assim que as duas frases do `prewarm` passaram a valer ao mesmo tempo, e os dois runtimes leram igual sozinhos. Se ele desloca a origem do emissor, desloca tudo o que o emissor emite |
| 2 | A §6 acabou de fixar que **"nascimentos" inclui a rajada**. Ler "nascimento" de um jeito na §6 e de outro na §9.1 seria a mesma palavra valendo duas coisas no mesmo documento |

**Achado ao conferir: ele estava fora de TODAS as contas.** O `startDelay`
aparecia em **um único lugar da spec inteira** — a linha da tabela de campos da
§9.1 — e em **nenhuma fórmula**. Não era só a rajada: o bloco do fluxo contínuo
da §4.2 também o omitia. É a mesma doença da contradição achada na v18.4 — uma
frase omitindo o que outra manda — e levou o mesmo conserto.

As três expressões passam a trazê-lo **por extenso, na mesma forma**:

| Seção | A conta |
|:---|:---|
| §4.2, fluxo contínuo | `t_cont = startDelay + t_k + τ(i − E_k)` |
| §4.3, rajada | `t_i = startDelay + time + c·interval` |
| §6, o corte no laço | `0 <= startDelay + time + c·interval < D` |

**A forma importa tanto quanto a decisão**, e a razão é do próprio Python: ele
quase implementou as duas coisas, porque leu as duas frases. Se o `startDelay`
aparece numa seção e some na outra, o próximo leitor faz o mesmo. Há teste que
falha se a forma **curta** voltar a qualquer uma das três.

**Onde as duas leituras separam**, escrito na §6 porque não é detalhe de
escrita: com `startDelay 0.3`, rajada em `time 0.8` e `D = 1`, a conta dá `1.1`
e o ciclo fica **fora** da volta (cortado, com aviso); pela letra antiga daria
`0.8` e ficaria **dentro**. Duas partículas diferentes na tela, do mesmo
arquivo, conforme o leitor.

**Nenhum dos oito casos separa as duas leituras** — todos têm `startDelay: 0`,
e agora há um teste que afirma isso e cai se a cobertura mudar.

Conformidade **71/71** · `tsc` limpo · validador `--todos` sem erro ·
`particulas.test.ts` **97**, todos verdes.

### v18.9 — Degrau 12, parte `C`, lote 3: a física ganha o interruptor, o reiniciar e o assar — 18/09/2026

Pelo `EXECUTANDO · as portas do formato`. **Porta D6**. A regra `physics` já
estava **completa** no editor: cria pela janela guiada, catorze campos em
Propriedades, alças de vento e gravidade na cena. E ela **simulava sempre**.
Faltavam os três gestos que a §6.5 prevê e a tela não oferecia.

| Gesto | O que faz | Onde está no formato |
|:---|:---|:---|
| **Simular** | o interruptor: parar de simular para posar o boneco em paz | é da tela; nenhum campo novo |
| **Reiniciar** (esta, e todas) | zera o estado acumulado | §6.5 `physicsReset`, §9.8 a chave `reset` |
| **Assar em chaves** | troca a simulação por timelines `bone` comuns | §6.5: *"Pode ser convertida em chaves pelo editor (bake)"*; decisão A7 do Humberto, 17/09 |

Arquivo novo: `editor/src/panels/rules-physics.ts`. Quatro ids novos em
`ui/actions-table.ts` e quatro entradas no menu Esqueleto.

**O assado é o item importante, e é o que o lote existe para entregar.** A §6.5
diz, com todas as letras: *"A física é a única simulação do formato. Um quadro
dela depende dos anteriores; é a exceção escrita do princípio 11. Arrastar a
linha do tempo para trás não devolve o mesmo cabelo."* Assar troca o estado por
chaves, e chave não tem estado. **E isso é provado por teste, não pela tela** —
dois testes irmãos, de propósito:

| Teste | O que mede |
|:---|:---|
| *"antes de assar, a MESMA medida muda quando se anda para trás"* | anda de `0` a `0,9` quadro a quadro, volta a `0,3`, vai de novo a `0,9`: os dois `0,9` **não batem**. É o defeito que a §6.5 descreve, medido |
| *"e depois de assado a animação toca para trás IGUAL, bit a bit"* | a mesma ida e volta, depois do assado: os dois `0,9` batem, matriz por matriz |

Sem o primeiro, o segundo não prova nada — poderia estar passando porque a
física nunca acumulou.

**O interruptor não vai para o arquivo.** Desligar é `active = false` em cada
`PhysicsConstraint` **viva**, que é o campo que o `skeleton.ts` consulta
(`if (!c.active || c.mix === 0) continue`). Não é `mix: 0`: `mix` mora no
`.bone`, e um interruptor de tela que sujasse o arquivo mandaria a escolha de
quem edita junto com o personagem. Mora em `RECORTE_prefs`, como o tema.

**E ele sobrevive a uma mudança estrutural.** Um `rebuild` monta constraints
novas, e elas nascem `active = true`: sem cuidado, acrescentar um osso
religaria a física **em silêncio**. O vigia mora no **documento**, e não no
painel — um painel some quando a aba dele não está à vista, e um interruptor
que para de valer ao trocar de aba é um interruptor que mente. Tem teste.

**Onde o programa não entende, ele avisa** (regra 21): com a simulação
desligada, cada regra de física diz *"simulação desligada na tela"* na própria
linha — ela existe, está ligada no arquivo, e não faz nada; sem essa linha quem
desligou e voltou meia hora depois procuraria o defeito no lugar errado. E o
assar **recusa falando**: base aberta em vez de animação, nome que não é de
física, animação de duração zero, osso que não existe, ou regra que não escreve
em nada — cinco frases diferentes.

**A regra assada fica desligada, e não apagada.** Os catorze campos dela são o
trabalho de quem ajustou o balanço; apagar jogaria isso fora, e reassar depois
de mudar um quadro exigiria remontar tudo. Ligada ela entraria **duas vezes** —
uma pelas chaves e outra pela simulação.

**Os três programas** (regra do Humberto): o **Spriter** não tem física nenhuma;
o **DragonBones** não tem constraint de física; o **Spine** 4.2+, de onde a §6.5
foi portada, tem o interruptor de física na barra de reprodução, tem o
reiniciar e tem o bake. Só um dos três tem a coisa, e a §6.5 é porte dele: a
tela segue o Spine.

A física **Global** (vento no esqueleto inteiro) continua **descartada** — é API
do jogo, não do editor.

### v18.8 — Degrau 12, parte `P1`: as cinco linhas do confronto dos dois runtimes — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, escrevendo decisões do Planejador
tiradas de `documentos/planos/CONFRONTO dos dois runtimes - particulas 2026-09-18.md`.
Só a spec da extensão e o teste da parte: o `P2` e o `P3` estão com o código na
mão, e a ordem é sempre **spec primeiro, runtime depois, caso prende**.

**O que o confronto achou.** Os dois runtimes foram escritos ao mesmo tempo,
cada um cego para o outro, só pela spec. **Os oito casos passam nos dois** — e
isso não bastou: cinco leituras bateram, **três discordaram**, e **nenhuma das
três é exercitada por caso nenhum**. Por isso os dois podiam passar e desenhar
coisas diferentes na mão de quem usasse.

| # | Onde | O que a spec não dizia |
|:---:|:---|:---|
| 1 | **§14** e §14.2 | A tolerância de `/particles/`. Um runtime pôs `1e-2` (a da §3.6 para ângulo), o outro `1e-3`, **e cada um tem o seu próprio comparador** — duas réguas querem dizer que o mesmo caso é medido com folgas diferentes conforme quem mede, e a prova deixa de ser uma prova só. Fixada em **`1e-3` para todo campo**, porque os dois batem as seis casas exatas |
| 2 | **§9.4.1** (nova) | *"Ponto uniforme (canais 3, 4)"* **não é uma conta só.** Há duas usuais e elas dão pontos **diferentes** para os mesmos dois `u`. Escrita a de **dobrar** (`se s + w > 1`, usa `1 − s` e `1 − w`): ela gasta os dois canais que a seção já nomeia e não chama uma raiz quadrada que a seção não pede |
| 3 | **§9.4.1** | Qual lista de arestas o `meshMode: "edge"` usa: as **arestas únicas da triangulação**, uniformes pelo canal 12, com `u3` ao longo da escolhida. **Nunca** o campo `edges` da malha — a §7 do núcleo o dá como opcional, padrão `[]`, *"só editor"*, e um emissor amarrado a ele não emitiria nada num arquivo normal, sem motivo visível para quem usa |
| 4 | **§9.3.1** (nova) | A ordem do `spherizeDirection` com o `spread`: **mistura primeiro, leque em volta da base misturada.** `spread` é meia-abertura, e meia-abertura se mede em volta da direção que vale. Na ordem contrária o leque **encolhe por `(1 − spherize)`** sem ninguém pedir, e com `spherize: 1` fecha de vez |
| 5 | **§6** | Se "nascimentos" inclui a rajada nas voltas de trás: **inclui.** Tratá-la à parte faria a explosão sumir ao virar a volta, e a emenda que o laço existe para esconder apareceria justo no efeito que mais se nota |

**E uma sexta, que a quinta fez aparecer.** Achada pelo chat do runtime Python
ao medir a consequência da linha 5: uma rajada cujos ciclos passam de `D`
**duplicaria partícula** na volta de trás. Com `time 0.1`, `cycles 5`,
`interval 0.5` e `D = 1`, os ciclos caem em `0.1, 0.6, 1.1, 1.6, 2.1` — e os
três últimos, deslocados de `−D`, caem **em cima** dos da volta atual, mesmo
`t_i`, índice diferente. A volta passa a levar **só os ciclos em `[0, D)`**, e o
leitor **avisa quantos** ficaram de fora: sem o corte o laço ganha uma
sobreposição que o autor não pediu; com o corte e sem aviso, some em silêncio um
ciclo que ele escreveu.

**A fronteira ficou escrita em símbolos, e não em palavras:** `0 <= instante < D`
— zero **fechado**, `D` **aberto**. Um ciclo exatamente em `D` é o primeiro da
volta seguinte, e contá-lo nas duas o duplicaria. É a mesma fronteira dos
índices do fluxo contínuo (`0 <= i < E(D)`), escrita do mesmo jeito de propósito:
duas frases com a mesma regra escritas diferente acabam divergindo. O caso que
separa as duas leituras é o mais banal que alguém escreve — uma rajada a cada
`0.5` s numa animação de `1` s.

**Nove testes novos**, e eles não só leem a spec: refazem as contas que ela
afirma. As duas fórmulas do triângulo dão pontos a mais de 1 px de distância
(se dessem o mesmo, a linha 2 seria enfeite); o leque da ordem errada encolhe
exatamente por `(1 − spherize)`; o exemplo do corte de ciclos confere (dois
ficam, três se sobrepõem); e o `edges` do núcleo é mesmo *"só editor"* — a razão
da spec tem de ser verificável, senão é opinião com voz de norma.

Conformidade **71/71** · `tsc` limpo · `particulas.test.ts` **94** e
`rig-no-validador.test.ts` **32**, todos verdes.

### v18.5 — Degrau 12, parte `C`, lote 2: o som dos eventos, que o editor nunca tocou — 18/09/2026

Pelo `EXECUTANDO · as portas do formato`. **Porta D5**. O formato tinha `audio`,
`volume` e `balance` na definição do evento (§4.5), a junção
`assets.audioBase + event.audio` está escrita na §2.8, e o
`runtime/src/animation.ts` já **entregava** o evento no instante certo (§8.6).

A tela tinha metade: a **chave** editava volume e balanço, e o caminho do som
aparecia **só para ler**. A definição — que é onde o som mora — não tinha campo
nenhum, a pasta de sons não tinha campo nenhum, e **o editor não tocava som
nenhum**.

| O quê | Onde |
|:---|:---|
| A **ficha da definição** do evento: o som, os cinco padrões, e o caminho **já juntado** com a pasta | `panels/event-key-editor.ts` |
| A **pasta dos sons** (§2.8 `assets.audioBase`), editável ali mesmo | `panels/event-key-editor.ts` |
| **Tocar ao clicar**: o ▶ lê o arquivo da pasta aberta do projeto e toca, com o volume da definição ou o da chave | `panels/event-key-editor.ts` |
| **Os sons da animação**, em ordem de tempo, cada um com o seu ▶ — no bloco que já aparece no painel Linha do tempo | `anim/event-keys.ts`, `panels/event-key-editor.ts` |
| `resolvedEventAudio`, `audioBaseOf`, `eventFirings`, `animationSounds`, `eventDefProblems` — puros, testáveis sem navegador | `anim/event-keys.ts` |
| O ícone `play` | `ui/icons.ts` |

O bloco da chave de evento deixou de ser gatilhado pela animação aberta: dentro
dele mora agora a ficha da **definição**, e o som de um evento é do arquivo, não
de uma animação. A parte de chavear continua dizendo *"abra uma animação"*, que
é a verdade dela.

**Onde o programa não entende, ele avisa** (regra 21): som sem extensão (§4.5
pede com extensão), volume fora de 0 a 1, balanço fora de −1 a 1, e **evento que
nenhuma chave dispara** — esse não toca nunca, e nada dizia. O ▶ que não pode
tocar **fala**: sem som escrito, sem pasta aberta, pasta só de leitura, ou
arquivo que não está lá — quatro frases diferentes, nenhuma delas um botão mudo.

**A §8.6 diz que o runtime NÃO DEVE tocar o áudio**, e ela continua valendo: a
leitura do arquivo mora no painel, não em `runtime/` nem em `anim/`. O runtime
entrega o caminho; o **editor** é o programa de autoria, e nele ouvir é o único
jeito de conferir sem abrir o jogo.

**Os três programas, antes de decidir a tela** (regra do Humberto): no
**Spriter** o som é um objeto próprio, com linha só dele e volume e panning
chaveáveis, e toca durante a reprodução; no **Spine** o som fica na
**definição** do evento (`audio`, `volume`, `balance`) — que é de onde a nossa
§4.5 veio — e toca quando o cursor cruza a chave; o **DragonBones** tem quadro
de som na linha do tempo e **não toca**: só nomeia para o runtime. O formato já
escolheu o modelo do Spine, e é o que a ficha desenha.

### v18.4 — Degrau 12, parte `P1`: o comparador não pode medir o `angle` da partícula em círculo — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, por pedido do Planejador, sobre
observação do chat do runtime Python. Uma seção nova na spec da extensão —
**§14.2** de `formato/extensions/BONE_particles.md` — e mais nada.

**O buraco.** O comparador do `pose-dump` mede ângulo por **distância
circular**, a que dá a volta em 360°. Para a pose de um osso está certo: `−170°`
e `190°` são a mesma pose. Para o `angle` de uma partícula **não**:
`251.145834` e `−108.854166` são exatamente 360° de diferença, e o segundo é o
que sai de um leitor que reduziu o ângulo para `−180..180` — o leitor que o
leiame do P-001 manda **falhar**. Medido em círculo, ele passa.

**E o gesto que causaria isso é o mais natural do mundo:** o campo se chama
`angle`; quem implementa a medida acrescenta `'angle'` ao conjunto de campos de
ângulo do comparador e pronto — a prova fica frouxa para os dois runtimes de uma
vez. É a cara da regra 21 que engana a nós, não o usuário.

**Duas regras, e a §14.2 as separa de propósito, porque confundi-las é fácil:**

| | O que diz |
|:---|:---|
| **A conta** | `angle` de `/particles/` é medido por diferença **simples**, `abs(esperado − obtido)`. **Nunca** circular. Em código: não entra no conjunto de campos de ângulo |
| **O tamanho** | `1e-3` grau — e **não** os `1e-2` que a §3.6 dá ao ângulo de pose |

**Por que mais apertado, escrito junto para ninguém "consertar" depois:** nada
aqui acumula. Toda saída é conta fechada de um `u` exato de 24 bits — sem passo,
sem iteração, sem erro que cresça com o tempo. E o dump arredonda a 6 casas, de
modo que dois leitores certos diferem no máximo **um passo de arredondamento**,
`1e-6`. O `1e-3` já deixa mil vezes de folga. Afrouxar para `1e-2` "porque é
ângulo" seria copiar a folga de um número que precisa dela — o ângulo de pose,
que vem de matriz e trigonometria encadeada — para um que não precisa.

**Uma honestidade que ficou escrita na própria seção:** o erro de 360° **não**
era escondido pelo tamanho da tolerância. Ele é 36 000 vezes maior que `1e-2`;
nenhuma tolerância razoável o esconderia. Quem o esconde é a **conta circular**.
As duas regras estão lá porque valem contra coisas diferentes: a primeira contra
o erro de 360°, a segunda contra o erro pequeno e constante que ninguém procura.

**Por que na spec, e não só no leiame.** Os dois runtimes chegaram à leitura
certa por conta própria — mas, e a observação é do chat do Python, **dois
leitores acertarem não prova que a frase basta: prova que ela bastou para
aqueles dois.** Um terceiro leitor, daqui a um ano, lê a §14.1 e não tem como
saber. Estava escrito só no leiame do P-001 e preso por um teste de runtime;
agora está onde um implementador de fora vai ler.

Dois testes novos prendem a linha e o par que a exerce. Suíte **3.584**
(3.554 verdes, 29 pulados, 1 vermelho antigo do manual) · `tsc` limpo ·
conformidade **71/71**. Nenhum código tocado além da spec e do teste: o `P2`
está escrevendo o runtime e lendo essa mesma spec.

### v18.0 — Degrau 12, parte `C`, lote 1: os sliders, e o Comando que nascia sem mandar em nada — 18/09/2026

Pelo `EXECUTANDO · as portas do formato`. **Porta D3** do encargo: o formato
tinha `Parameter` (§8.1) e `driver` (§8.2) desde sempre, os dois runtimes já os
liam, e a tela não tinha por onde a pessoa usar.

**O defeito que veio junto, e que é o motivo de o lote existir.** A regra
Comando criada pelo editor nascia com `targets: []`, e o
`runtime/src/constraints/driver.ts` desliga sozinho uma regra sem alvo
(`if (data.targets.length === 0) this.active = false`). Quem criava um slider
via a regra na lista, arrastava, e **não via efeito nenhum** — sem uma palavra.
Regra 21 da casa em pessoa.

⚠️ O degrau 9 já tinha fechado *"regra Comando vazia avisa"*, e esse aviso
continua certo — **para quem esvaziou a regra à mão**. Ele não servia de
conserto para uma regra que nascia vazia sozinha: assim ele esconderia o
defeito de nascença atrás de uma frase que parecia esperada. As duas coisas
valem ao mesmo tempo, e são **dois testes**, não um:

| O quê | Onde se prova |
|:---|:---|
| a regra nasce **com alvo**, e o runtime a roda: o osso gira | `regras.test.ts`, *"e ela MEXE o osso: o editor cria, o runtime roda"* |
| quem **esvazia** o alvo à mão continua vendo o aviso do degrau 9 | `regras.test.ts`, *"quem esvazia o alvo à mão CONTINUA vendo o aviso"* |

O que entrou:

| O quê | Onde |
|:---|:---|
| A **lista de parâmetros** na aba Regras, com a barra do valor em cada linha | `panels/rules.ts`, `panels/rules-model.ts` |
| A **ficha do parâmetro** em Propriedades: nome, nome para ler, pasta, mín., máx., valor, dá a volta, e a **origem** `source` (osso, o que ele lê, de, até) | `panels/properties-model.ts` |
| Os **alvos** da regra Comando: um grupo por alvo, com osso, propriedade, modo e **uma linha por chave**, com o valor do parâmetro escrito no rótulo | `panels/properties-model.ts` |
| A janela guiada passou a perguntar **em que osso o comando manda** e **o que ele mexe** | `panels/rules.ts` |
| `Parâmetro` e `Animação` deixaram de ser campo de TEXTO: são a lista do que existe | `panels/properties-model.ts` |
| Botões em ícone no título de um grupo (`GroupAction`), para o que é **lista** e não campo: mais um alvo, tirar este, pôr e tirar a origem | `panels/properties-model.ts`, `panels/properties.ts` |
| `RenameParameter`, que arrasta a regra Comando e a timeline `parameter` junto | `panels/rules-model.ts` |
| `DeleteParameter`, que leva as chaves dele | `panels/tree-commands.ts` |
| `Selection.parameters`, opcional como `pilha` e `endMerge` | `contract.ts` |

**Nenhum campo novo no núcleo do formato** — e nenhum inventado: cada campo da
ficha está na §8.1 ou na §8.2.

**Onde o programa não entende, ele avisa** (regra 21): parâmetro de faixa
impossível (`max <= min`, L1), padrão fora da faixa, osso de origem que não
existe, faixa de origem vazia, parâmetro com `source` **e** chaves (§8.1 proíbe),
parâmetro que **nenhuma** regra lê, alvo sem chave, chaves fora de ordem, e
regra que aponta para um parâmetro apagado. Tudo escrito na lista ou embaixo do
grupo, em vermelho.

**A barra escreve o `default`.** É o número que a setup pose usa
(`setToSetupPose` copia `default` para `Skeleton.parameters`), então arrastar
move o boneco na hora, pela regra Comando que o lê. Com uma animação aberta a
mesma escrita vira **chave** na timeline `parameter`, pela regra dos dois modos
— a `anim/keying.ts` já mapeava `/parameters/i/default` para o alvo `parameter`,
e nada precisou ser inventado. Com `source` ligado a barra **trava**: o valor é
conta do osso, e uma barra que não guarda o que se escreve é pior que nenhuma.

**Os três programas, antes de decidir onde o parâmetro mora** (regra do
Humberto): o **Spriter** não tem parâmetro nenhum — tem variáveis, numa janela
à parte; o **DragonBones** também não tem; o **Spine 4.3** tem o *Slider*, que
é um item de lista com uma barra na própria linha e a ficha no painel da
direita. Seguimos o Spine, que é o único dos três que tem a coisa. A lista
ficou na aba **Regras**, e não numa aba nova, porque é a regra Comando que lê o
parâmetro — as duas se leem juntas, e uma aba nova custaria uma coluna que a
medição já acusa apertada.

### v19.4 — Degrau 12, parte `P2`: a nona frase, conferida e presa — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime TS`. A nona frase calada que o chat do
formato achou: **a timeline de `emitting` é lida no RELÓGIO DO ESQUELETO**, o
mesmo em que o animador pôs a chave, e não em `t − startDelay`.

**Este runtime já estava certo** — nada mudou no código. O que entra são dois
testes, porque uma leitura certa sem teste é uma leitura certa por sorte.

A régua por trás, que vale para o que vier depois: **o `startDelay` desloca
NASCIMENTOS, que o programa gera; não desloca CHAVES, que uma pessoa põe à
mão.** Se a timeline seguisse o relógio do emissor, mexer no `startDelay` faria
todas as chaves de `emitting` andarem sem se moverem na tela — o animador veria
a chave parada e o efeito acontecendo noutro instante.

O caso que separa as duas leituras: `startDelay 0.2`, `rate 10`, chave
`emitting: false` em `0.5`. A torneira fecha em `0.5` **do esqueleto**, e nascem
`0.2`, `0.3` e `0.4`. Lida em `t − startDelay`, a chave valeria em `0.7` e a
lista iria até `0.6`. Com `startDelay: 0` as duas coincidem — é o caso dos oito,
e é por isso que a frase estava calada.

**Os dois testes foram provados ao contrário.** O código foi trocado de
propósito para ler no relógio do emissor: os dois ficaram vermelhos, no ponto
certo, e só então o código voltou. *Antes de provar que consertou, prove que o
defeito existia.*

A linha da spec ainda estava sendo escrita quando isto fechou. Quando ela sair,
é o texto dela que manda — e o teste está aqui para acusar se discordar.

2 testes novos (64 no arquivo da parte).

### v19.1 — Degrau 12, parte `P2`, lote 5: as linhas novas da spec, implementadas — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime TS`. O confronto rendeu cinco linhas
novas à spec da extensão, e este lote as implementa **lendo o texto delas**, e
não a mensagem que as anunciou.

| § | O que entrou |
|:---|:---|
| **9.4.1** | `meshMode` `edge` e `triangle`, que este runtime se recusava a adivinhar |
| **9.4.1** | As **arestas únicas da triangulação**, ordenadas pelo par crescente — e **nunca** o campo `edges` da malha |
| **6** | O corte dos ciclos de rajada fora de `[0, D)`, com o `D` **aberto**, e o aviso de quantos ficaram de fora |
| **4.3** | O `startDelay` **toca a rajada**: `t_i = startDelay + time + c·interval`, e o corte usa a mesma expressão |
| **14.2** | A tolerância do bloco `/particles/` é **`1e-3` para todo campo** — inclusive o `scale`, que estava em `1e-4` |

#### Três coisas que este lote aprendeu, e que valem mais que o código

**A recusa de adivinhar valeu a linha.** Enquanto a §9.4.1 não existia, `edge` e
`triangle` não desenhavam e avisavam. Foi essa recusa que deu ao confronto uma
divergência para decidir em vez de um empate silencioso — o outro runtime
escolheu uma fórmula e escreveu que era uma escolha, e as duas condutas juntas
mostraram que quem estava errada era a spec.

**A ordem da lista de arestas É a conta.** Como a escolha é `floor(u12 · M)`, a
mesma malha escrita com os triângulos noutra sequência escolheria outra aresta
para o mesmo `u12` — e **nada a jusante mostraria**. Há teste comparando duas
escritas da mesma triangulação e exigindo a mesma lista.

**O teste do `spherizeDirection` foi conferido ao contrário.** O primeiro teste
que alguém escreveu para essa ordem **deu verde falso**. Este foi provado
virando a ordem no código de propósito: o teste ficou vermelho, e só então
voltou. Um teste que nunca se viu falhar não é um teste.

#### O corte dos ciclos, e por que a fronteira tem símbolos

`0 <= startDelay + time + c·interval < D`, zero **fechado**, `D` **aberto**. Um
ciclo que caia exatamente em `D` é o primeiro da volta **seguinte**, e contá-lo
nas duas o duplicaria — que é o defeito que o corte existe para matar. O caso
que separa as duas leituras é o mais banal que alguém vai escrever: um
`interval` que divide a duração certinho.

E o corte **avisa**. Cortar em silêncio some com um ciclo que o autor escreveu e
não dá sinal — errado pelo mesmo motivo que não cortar.

15 testes novos (62 em `runtime/testes/particulas.test.ts`).

### v18.7 — Degrau 12, parte `P2`, lote 4: o desenho, a ordem, e o que o confronto decidiu — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime TS`. Fecha a 1ª fase do módulo **P** no
runtime TypeScript, e traz o que o confronto com o runtime Python decidiu.

| O quê | § |
|:---|:---|
| A cor: `startColor` (uma só `u` para os quatro componentes) × `colorOverLifetime` × `alphaOverLifetime` | §9.7 |
| A folha de quadros, nos dois modos, com o `startFrame` por cima | §9.8 |
| O emissor entra na lista de desenho, no lugar do slot na `drawOrder`, e o `clipping` vale para ele | §9.9, spec 9.5 e 7.7 |
| O emissor desenhado no renderizador de referência (Canvas 2D) | §7, §8 |

**Nenhum campo de mistura no emissor:** ele usa o `blend` do slot, como todo
anexo (spec §7.12). Fumaça aditiva mora num slot aditivo.

#### O que o confronto dos dois runtimes decidiu

Os dois passam os oito casos, e o confronto está em
`documentos/planos/CONFRONTO dos dois runtimes - particulas 2026-09-18.md`.
**Cinco leituras bateram sem combinação nenhuma** — essas não precisam de linha
na spec. Três mudaram este runtime:

| O quê | Ficou |
|:---|:---|
| A tolerância do `angle` no comparador | **`1e-3`**, e não a `1e-2` da §3.6. Cada runtime tem o seu comparador, e **duas réguas não são uma prova só** |
| A ordem do `spherizeDirection` com o `spread` | **Mistura primeiro, leque em volta da base misturada.** Este runtime fazia ao contrário |
| O guarda do `ANGLE_FIELDS` | Teste novo que afirma que `'angle'` **não está** nesse conjunto |

**O achado da ordem do `spherizeDirection`, que é o que importa nele:** abrir o
leque em volta de `direction` e misturar depois **encolhe o `spread` por
`(1 − spherize)`** sem ninguém pedir — com `spherize: 1` o leque fecha de vez e
toda partícula sai no mesmo ângulo. `spread` é **meia-abertura** (§9.3), e
meia-abertura se mede em volta da direção que vale: um campo não pode mudar o
tamanho de outro em silêncio. Chegaria na mão de quem usa como *"o leque some
quando eu aumento o spherize"*, e ninguém acharia a causa sem medir. **Nenhum
caso o separava** — os oito têm `spherize: 0`.

**São duas regras contra dois erros diferentes**, e estavam juntas numa razão só
até o chat do formato separar: a conta **simples** (nunca a circular) protege do
erro de **360 graus**, que nenhuma tolerância pegaria — 360 é 36 mil vezes maior
que `1e-2`; a tolerância **`1e-3`** protege do erro **pequeno e constante** que
ninguém procura.

#### Um vermelho intermitente a menos

O caso `--adaptador` de `ferramentas/testes/conformidade.test.ts` ficava vermelho
na suíte inteira e verde sozinho: ele abre **71 subprocessos**, um por caso, e
com três chats trabalhando passava dos 180 s. **O relógio subiu para 600 s; o
escopo não mudou.** Ele não foi pulado nem encurtado, porque é o teste que
prova que o executor roda um runtime **de fora** — que é a razão de a suíte
servir a outra implementação que não a nossa.

Um vermelho intermitente é pior que um quebrado: todo mundo aprende a olhar o
vermelho e dizer *"ah, é aquele"*, e é assim que um vermelho **de verdade**
passa despercebido.

#### O que espera a spec, e não foi adivinhado

| O quê | Espera |
|:---|:---|
| `meshMode` `triangle` e `edge` | A §9.4.1 (fórmula de dobrar; arestas únicas da triangulação, **nunca** o campo `edges`, que o núcleo declara "só editor") |
| Ciclos de rajada que passam de `D` no laço | A linha da §6: a volta leva só os ciclos em `[0, D)`, e avisa quantos ficaram de fora |

10 testes novos (47 em `runtime/testes/particulas.test.ts`, 20 em
`ferramentas/testes/medida-particulas.test.ts`).

### v18.3 — Degrau 12, parte `P2`, lote 3: a medida `particles` do pose-dump, e os oito casos passam — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime TS`. O `pose-dump` da §12.4 não tinha
como falar de partícula, e os oito casos pediam uma medida nova. Ela mora em
`ferramentas/src/conformidade/`, e o formato dela está escrito na §14.1 da spec
da extensão: **os casos são o contrato que ela cumpre**, e nenhum campo foi
inventado aqui.

| O quê | Onde |
|:---|:---|
| `measure: "particles"`, com `flow`, `index`, `birth`, `life`, `age`, `x`, `y`, `angle`, `scale` | `ferramentas/src/conformidade/pose-dump.ts` |
| O comparador do bloco, com a régua certa por campo | o mesmo arquivo, `compareParticles()` |
| A pose do osso em `t_i`, que o `space: "world"` exige (§7.2) | `runtime/src/particles/bone-poser.ts` |

**Os oito casos de `conformidade/casos-pendentes/` passam no runtime
TypeScript** — `node ferramentas/conformidade.mjs --casos conformidade/casos-pendentes`
diz 8 de 8. Isso **não** é o confronto: o runtime Python escreve a mesmíssima
spec sem olhar para este, e quem move os casos para `conformidade/casos/` é o
Planejador, só depois que o `npm run conformidade:dois` puser os dois lado a
lado campo a campo sem diferença. A varredura de sempre continua dizendo
**71 de 71**: a pasta pendente não entra nela.

Três decisões do comparador, cada uma com um caso por trás:

| O quê | Por quê |
|:---|:---|
| O `angle` **não** leva distância circular | O leiame do P-001 diz em letras que um leitor que reduza o ângulo a `−180..180` **falha** o caso — e pela régua circular `251.145834` e `−108.854166` ficam a **zero grau** um do outro. A tolerância continua a `1e-2` da §3.6: o que mudou é a régua, não a folga. Uma prova frouxa engana **a nós**, e é o terceiro rosto da regra 21 |
| `flow` e `index` são **exatos** | São a identidade da partícula (§3.1), não uma medida |
| A **ordem e o tamanho** da lista contam | A lista **é** a ordem de desenho já cortada por `maxParticles` (§7.1). Um comparador que ordenasse antes de olhar deixaria passar o P-005 e o P-007 |

E a linha que a §14.1 já mandava: emissor sem ninguém vivo sai como **lista
vazia**, e não some da chave — sumir confundiria *"não há partícula"* com *"o
leitor não implementa P"*.

19 testes novos em `ferramentas/testes/medida-particulas.test.ts`, entre eles o
contraste do P-006 **medido**, e não citado: trocar `space` de `"world"` para
`"local"` no mesmo arquivo leva a mesma partícula de `(100, 0)` para `(0, 100)`.

### v18.1 — Degrau 12, parte `P2`, lote 2: a posição, a forma e a vida — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime TS`. A partícula passa a ter **lugar**:
a posição é conta fechada da idade, e não soma de passos. É a linha que separa
este formato do Godot e do Unity, que simulam para a frente.

| O quê | §  |
|:---|:---|
| A conta fechada com gravidade e arrasto linear, pelo `expm1` | §8 |
| As formas `point`, `circle`, `rectangle`, `edge` e `bone` | §9.4 |
| Vida, velocidade, abertura, giro e tamanho, cada um no seu canal | §9.2, §9.3, §9.6 |
| `space: "local"` e `space: "world"` — quem solta a partícula e quando | §7.2 |
| O teto de vivas **sem bloquear o nascimento** | §7.1 |
| `sortMode`, e o desempate `(t_i, fluxo, índice)` | §9.9 |

**Seis dos oito casos batem campo a campo com o `esperado.json`, na primeira
rodada:** P-001, P-003, P-004, P-005, P-007 e P-008. O P-006 espera o lote 3
(precisa da pose do osso em `t_i`) e o P-002 é de 2ª fase.

Três coisas escritas para ninguém descobrir sozinho:

| O quê | |
|:---|:---|
| O ângulo sai **como está** | `251.145834`, e não `−108.854166`. Reduzir a `−180..180` faz o P-001 falhar, e só no `angle` |
| O teto **não bloqueia o nascimento** | Bloquear é estado: quem nasce passaria a depender de quem estava vivo antes. A partícula nasce sempre; o desenho leva as `maxParticles` mais novas, e o emissor **conta quantas cortou** |
| `meshMode` `edge` e `triangle` **não desenham, e avisam** | A §9.4 diz "ponto uniforme (canais 3, 4)" sem dizer **qual** fórmula, e as duas usuais dão pontos diferentes dos mesmos dois `u`. Adivinhar aqui é um C-299 esperando para acontecer. Pedido de uma linha na spec em `documentos/planos/DESVIOS P2 - runtime TypeScript 2026-09-18.md` |

11 testes novos (38 no arquivo da parte). As leituras que a spec não decidiu
estão listadas, com o motivo, em
`documentos/planos/DESVIOS P2 - runtime TypeScript 2026-09-18.md` — fora do
encargo de propósito, para que o chat do Python não leia a leitura deste.

### v17.9 — Degrau 12, parte `P2`, lote 1: o acaso e o nascimento, no runtime TypeScript — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime TS`, lendo **só** a spec da extensão
`formato/extensions/BONE_particles.md` e os oito casos de
`conformidade/casos-pendentes/`. O runtime Python escreve a mesmíssima extensão
ao lado, **e um não olha o outro**: é esse isolamento que prova que a spec
basta, e foi assim que se acharam o C-299 e o C-300.

O runtime de referência passa a ler o módulo lateral **P**, 1ª fase. Neste lote
entram o acaso e o nascimento:

| O quê | Onde |
|:---|:---|
| O hash PCG de 32 bits e a tabela de canais congelada (§3.2, §3.3) | `runtime/src/particles/hash.ts` |
| A integral da taxa, a inversa, o pré-aquecimento, o laço e as rajadas (§4, §5, §6) | `runtime/src/particles/emission.ts` |
| O anexo `BONE_particle` com os padrões da §9 | `runtime/src/attachments/particle.ts` |
| A leitura do anexo, com os cinco fallbacks da §7.4 | `runtime/src/loader.ts`, `loadParticle()` |
| A timeline prefixada `BONE_particle` / `emitting`, em degraus (§4.1) | `runtime/src/data.ts`, `ParticleEmittingTimelineData` |

**Os cinco números de referência da §3.2 batem, exatos** — `pcg(0)`, `pcg(42)`,
`pcg(0xFFFFFFFF)`, `acaso(42, 0, 7, 0)` e `acaso(42, 0, −3, 0)` — e é a
primeira coisa que o teste confere: um runtime que não os reproduza **não
implementa P**, e o defeito é o hash, não a conta.

Os nascimentos dos casos saem certos nos seis que são de 1ª fase: 11 em t = 0.5
no P-001 · 24 em t = 0.02 no P-003, com as voltas de trás emendadas · 23 no
P-004, com os índices negativos até −20 · 12 vivas com `maxParticles 5` no
P-005, porque **o teto não bloqueia o nascimento** · **6 de 10** no P-007, e não
cinco · e a lista do P-008 volta igual depois de ir a 0.9, a 0.3 e a 0.9 outra
vez.

**Três coisas que este lote se recusou a fazer, e é de propósito:**

| O quê | Por quê |
|:---|:---|
| `shape` desconhecida **não** cai para `point` | Mudaria o desenho inteiro e o usuário não teria como notar. O emissor não desenha e o leitor avisa (§7.4, regra 21 da casa) |
| Uma timeline de `rate` é **recusada com aviso** | Taxa em rampa é o ramo `linear` da §4.2, e isso é **2ª fase**. A conta está escrita inteira na spec para que o segundo leitor não invente a dele; nenhum código aqui a implementa |
| O `esperado.json` do P-002 continua **vazio** | É o caso da 2ª fase. Há teste prendendo essa frase: um runtime que "passasse" nele inventando a rampa quebrou a regra, não a cumpriu |

`prewarm` com `looping: true` é ignorado e o leitor avisa (§6); `rate` negativo
vira `0` **na chave**, antes de integrar (L1 `RANGE_PARTICLE_RATE`).

27 testes novos em `runtime/testes/particulas.test.ts`.

### v20.2 — Degrau 12, parte `P3`, lote 7: o guarda dos casos sobrevive à mudança de pasta — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime Python`. **Fecha a parte `P3`.** Os
dezessete casos de partícula passaram nos dois runtimes e foram movidos para
`conformidade/casos/`; a suíte foi de 71 para **88 casos**.

Duas coisas no teste que varre os casos, e as duas são sobre o **guarda**, não
sobre o número:

| O quê | Por quê |
|:---|:---|
| Conta os `P-*` nas **duas** pastas — `casos/` e `casos-pendentes/` — e exige **17** | trocar `16` por `17` consertaria o sintoma e deixaria o guarda **cego para a próxima mudança de pasta**. O que a contagem exata existe para pegar é um caso **sumindo**, e isso nenhuma asserção por caso enxerga |
| `skipUnless` com a frase escrita quando as pastas não estão ao lado | `runtime-python/` roda só com biblioteca padrão e o README convida a copiá-lo sozinho. Quem faz isso levava um **traceback** em vez de uma frase. O `test_conformidade.py` ao lado já fazia o certo, e serviu de molde |

**Medido, não suposto:** a cópia do `runtime-python/` fora do projeto agora
termina em `OK (skipped=3)`. Com o arquivo anterior ela terminava em `ERROR`,
com o traceback apontando para a linha que subia as pastas.

**O outro runtime chegou ao mesmo tipo de conserto sozinho**, por outro caminho:
em vez do número, ele prendeu a **propriedade** — a numeração dos casos não pode
ter buraco, e são pelo menos dezessete. Os dois viram que trocar o número
consertaria o sintoma e perderia o guarda.

**Estado ao fim da parte `P3`:** conformidade **88 de 88** (`P: 17/17`) pelos
dois caminhos — o `conformidade.py` deste runtime e o executor oficial em Node —,
e **261 testes** próprios, sem vermelho.

### v20.0 — Degrau 12, parte `P3`, lote 6: a emissão por trechos da §4.2 — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime Python`. **Conserto de um defeito meu**,
achado por mim depois de dois confrontos me darem razão, e que **nenhum dos
dezesseis casos exercita**.

**O atalho.** Eu calculava `t_i = startDelay + i / rate` para todo `i` e depois
jogava fora quem caísse onde `emitting` é falso. A §4.2 manda outra coisa: o
nascimento do índice `i` é o instante em que `E(t) = i` — a **inversa da
integral** —, e um trecho de taxa efetiva zero tem **área zero**, logo **não
consome índice**: a numeração retoma inteira no trecho seguinte.

As duas contas concordam enquanto a torneira só **fecha**. Divergem quando ela
**religa**:

| `rate 20`, ligado `[0, 0.5)`, desligado `[0.5, 0.8)`, ligado de novo | índices |
|:---|:---|
| O que eu fazia | `0..9` e depois **`16..20`** |
| O que a §4.2 manda | `0..9` e depois **`10..14`**, seguidos |

**E o que importa não é a contagem: é a identidade.** A partícula que nasce em
`0.80` é o índice `10` pela spec e era o `16` no meu código. **Índice diferente é
`hash` diferente** — vida, velocidade, ângulo e cor, todos outros. A mesma
partícula com dois nomes desenha duas coisas, e um caso que contasse só quantas
vivas há pegaria isso por acaso ou não pegaria.

**Por que passou.** O atalho estava **certo quando foi tomado**: com a taxa
constante, `i/rate` É a inversa da integral. Ficou errado quando o `emitting`
entrou e a taxa efetiva ganhou degraus — e ninguém volta a conferir um atalho
que nunca falhou. É a mesma forma do erro que o Planejador achou no próprio
trabalho no mesmo dia: **os dois somamos em vez de integrar.**

Entra a classe `Trechos` em `recorte/particles.py`: os trechos de taxa efetiva a
partir da origem `o = startDelay`, o acumulado por trecho (o único acumulado que
a §3.4 permite — por chave, nunca por quadro), `E(t)` e a inversa. O `_emitting_at`
some do laço de nascimento: os trechos já carregam a torneira.

**16 de 16 casos passam**, incluindo o P-016 regerado, que agora espera as quatro
partículas de `0.3` a `0.45`. Conformidade 71 de 71 pelos dois caminhos.
**Testes do runtime Python: 253 → 261.**

**Uma correção minha, de um número que eu mesmo mandei:** ao levantar o defeito
eu disse que o rig daria **14** partículas. Dá **15**. A que nasce exatamente em
`t = 1.0` está viva, com idade `0` — é a regra de `t_i <= t` que o P-001 e o
P-005 já medem. Está dito aqui porque esse número foi para o desenho do P-017.

### v19.9 — Degrau 12, parte `P3`: o runtime Python contra os oito casos novos — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime Python`. Os casos P-009 a P-016
entraram em `casos-pendentes/`, escritos pelo chat do formato; este runtime é a
**terceira fonte** que tem de bater com eles.

**15 de 16 passam, maior diferença "nenhuma".** Falta o P-016, e a razão está
aberta, não consertada.

**Os dois que falharam na primeira rodada, e o que cada um era:**

| Caso | O que era | Como se provou |
|:---|:---|:---|
| **P-011** rajada com laço | a **entrada** não tinha `animations`, e a sonda não tinha `"animation"`. A §6 diz que `D` é a duração da animação que toca — sem ela não há `D`, logo não há volta de trás. O P-003 e o P-008, os outros dois casos de laço, têm as duas coisas | a hipótese foi testada **só na memória**, sem gravar em cerca alheia: com uma animação de `duration 1` o runtime deu o esperado campo a campo nas duas amostras, e o aviso saiu com "2 ciclo(s) fora da volta". O chat do formato consertou a **entrada**, não o esperado — e o caso passou |
| **P-016** `emitting` com `startDelay` | **em aberto.** O leiame fixa que a timeline é lida no relógio do esqueleto, "onde o animador pôs a chave", e a conta logo abaixo gera os nascimentos na janela `[0, 0.5)` e **depois** soma o `startDelay`, chegando a `0.75` — instante em que `emitting` é falso nesse mesmo relógio, e produzindo o defeito que o leiame diz querer evitar | não consertado. Sobe ao Planejador e espera a terceira fonte |

**A pergunta exata do P-016, que é o que vale guardar:** a janela do `emitting`
fecha sobre o **parâmetro da integral** (o tempo do emissor, contado do zero) ou
sobre o **instante final do nascimento** (o do esqueleto)? Os dois são
defensáveis. O leiame afirma o segundo e calcula o primeiro.

**O teste que varre a pasta passou a contar 16**, e passou a listar **todas** as
falhas de uma vez em vez de parar na primeira: um vermelho aqui costuma dizer
algo sobre o **caso**, e uma lista de nomes é o que separa uma expectativa errada
de um defeito deste runtime que atinge vários. A contagem exata continua sendo
o que pega um caso **sumindo** da pasta, coisa que nenhuma asserção por caso veria.

### v19.0 — Degrau 12, parte `P3`, lote 5: o runtime Python contra as linhas novas da spec — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime Python`. A spec ganhou quatro linhas
normativas na v18.8, saídas do confronto dos dois runtimes; este lote confere as
quatro contra o código e conserta o que não batia.

**A diferença de verdade estava numa ordem de lista.** A §9.4.1 manda que as
arestas de `meshMode: "edge"` sejam as **únicas da triangulação**, `(a, b)` com
`a < b`, **ordenadas pelo par crescente**. O meu código montava a mesma lista,
sem repetição e com o mesmo critério — mas **na ordem em que descobria** os
triângulos. Como a escolha é `floor(u12 · M)`, a ordem **é** a conta: a mesma
malha escrita com os triângulos noutra sequência escolhia **outra aresta** para o
mesmo `u12`, e nada a jusante mostraria isso. Dois testes prendem, e um deles
compara duas escritas da mesma triangulação.

| Linha nova | O que era preciso fazer |
|:---|:---|
| **§9.4.1** `meshMode`, as contas por extenso | a fórmula de **dobrar** e a área acumulada já eram as minhas; a **ordem das arestas** foi corrigida |
| **§9.3.1** mistura primeiro, leque depois | já era assim. Teste novo mede o efeito colateral da ordem contrária: o leque encolhendo por `1 − spherizeDirection` |
| **§6** a rajada na volta, `0 <= instante < D` | já era assim, com o `D` aberto. Conferido no texto |
| **§14.2** `1e−3` reto em todo campo de `/particles/` | já era assim, com canal próprio |

**Onde o programa avisa, um a mais:** `meshMode` `edge` ou `triangle` numa malha
**sem triangulação** não desenha e avisa (`PARTICLE_MESH_NO_TRIANGLES`). Cair
para `vertex` calado desenharia uma forma diferente da que o autor pediu.

**E uma oitava frase calada, achada ao conferir o corte novo:** a §4.3 escreve
`t_i = time + c·interval` **sem** `startDelay`, a §9.1 diz que `startDelay` é o
ponto "a partir daqui" para os nascimentos sem dizer de qual fluxo, e a §6 nova
escreve o corte também sem ele. O meu código desloca a rajada pelo `startDelay`
e corta no instante deslocado. Com `startDelay 0.3` e uma rajada em `0.8` numa
animação de `1 s`, as duas leituras discordam sobre se o ciclo entra na volta.
**Nada mudado**, leitura registrada nos Desvios e levantada ao Planejador; os
oito casos têm `startDelay: 0` e não a separam.

**Testes do runtime Python: 240 → 253.** Conformidade 71 de 71 e os oito de
partícula continuam passando, pelos dois caminhos.

### v18.6 — Degrau 12, parte `P3`, lote 4: o que o confronto dos dois runtimes achou — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime Python`, cumprindo duas decisões do
`PLANEJADOR · dd3937` saídas do confronto com o runtime TypeScript
(`documentos/planos/CONFRONTO dos dois runtimes - particulas 2026-09-18.md`).

**1. A rajada volta nas voltas de trás do laço — e o meu código não voltava.**

O ponto foi levantado pelo `P2`, não por mim, e eu **não tinha decidido nada**:
a assinatura da minha própria função entregava o ponto cego
(`burst_births(emitter, t)`, sem `duration` nem `loop`). Medido antes de opinar,
com uma rajada em `0.1`, vida `2` e `D = 1`:

| `t` | vivas, antes | vivas, agora |
|:---:|---:|---:|
| 0.05 | **0** | 8 |
| 0.5 | 4 | 8 |
| 1.05 | **0** | 8 |

A explosão aparecia, **sumia ao virar a volta** e reaparecia. É a emenda que a
§6 existe para tirar, e justo no efeito em que ela mais se nota. A §6 diz "os
nascimentos", não "os do fluxo 0", e uma rajada é um nascimento.

**E um segundo buraco, dentro da leitura nova, achado ao implementá-la:** os
ciclos de uma rajada podem passar de `D`. Com `time 0.1, cycles 5, interval 0.5`
e `D = 1` os ciclos caem em `0.1, 0.6, 1.1, 1.6, 2.1`, e a volta de trás põe o
de `1.1` **em cima** do de `0.1` — mesmo `t_i`, índice diferente, duas partículas
onde o autor pediu uma. Decisão do Planejador: **a volta leva só os ciclos de
`[0, D)`, e o emissor avisa quantos ficaram de fora** (`BURST_OUT_OF_LAP`). É a
regra que a §6 já dá ao fluxo contínuo, palavra por palavra; o aviso responde ao
descarte calado. **Fora do laço nada muda** — é o laço que corta.

**2. A régua do canal `particles` é própria, e são DUAS regras contra DOIS
erros.**

Correção de premissa vinda do chat do formato, e ela muda o motivo, não a
decisão: **nenhuma tolerância jamais escondeu o erro de 360 graus** — 360 é
dezenas de milhares de vezes qualquer folga razoável. Quem o esconde é a **conta
circular**. São duas regras separadas:

| A regra | Contra qual erro |
|:---|:---|
| diferença **reta**, nunca distância circular | o ângulo dobrado para `−180..180`, que o leiame do P-001 manda falhar |
| **`1e−3`**, mais apertada que os `1e−2` da §3.6 | o erro pequeno e constante, o que ninguém vai procurar |

E o buraco que isso descobriu: o canal de partícula **pegava emprestada** a
tolerância de `position` — e `position` é uma das três que a física afrouxa para
`1e−2`. Um caso de partícula com `physicsDt` teria medido as partículas com
`1e−2` **sem ninguém pedir**. Agora há a chave `"particle": 1e−3`, fora do
afrouxamento da física, com um teste que prova que ela não se mexe quando as
réguas da física entram. Régua que se mexe por causa de um campo que não tem
nada a ver é a mesma família do verde que não foi medido.

**Testes do runtime Python: 230 → 240.** Conformidade 71 de 71 e os oito casos
de partícula continuam passando, pelo `conformidade.py` e pelo executor oficial
em Node.

**Uma coisa dita como é:** a rajada no laço foi implementada **antes de a linha
cair na spec** — conferi, e as §4.3 e §6 ainda não a traziam. A decisão estava
escrita e sem ambiguidade, e a ordem de fazer foi do Planejador; mas a ordem da
casa é spec primeiro, runtime depois, e **quando a linha chegar é o texto dela
que manda**. Se disser outra coisa, o código muda.

### v18.2 — Degrau 12, parte `P3`, lote 3: o desenho, a ordem e o dump — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime Python`, **só pela spec** da extensão.
Fecha o módulo lateral **P** no runtime Python, 1ª fase.

**Os oito casos passam, e sem diferença nenhuma:**

```
python runtime-python/conformidade.py --casos conformidade/casos-pendentes
8 de 8 passaram.   P: 8/8          (maior diferença: nenhuma, nos oito)
```

Isso **não** os tira de `casos-pendentes/`: quem move é o Planejador, e só
quando os **dois** runtimes passarem e o confronto campo a campo não achar
diferença. Um runtime que passa sozinho não prova nada.

| O quê | Onde |
|:---|:---|
| O teto de vivas da §7.1: o nascimento **não** é bloqueado; o desenho leva as `maxParticles` mais novas | `recorte/particles.py`, `desenhar()` |
| A ordem `(t_i decrescente, fluxo crescente, índice decrescente)`, e o `sortMode` | o mesmo arquivo |
| O bloco `measure: "particles"` da §14.1, com os nove campos e as seis casas | `recorte/pose_dump.py`, `_particles_sample()` |
| A pose do osso **no instante do nascimento**, para `space: "world"` e `shape: "mesh"` | `build_pose_dump()`, `pose_em()` — um segundo ator, função pura de `t_i`, com cache que só poupa trabalho |

**Uma armadilha de ferramenta, escrita para ninguém "consertar" depois.** O
comparador do `pose-dump` mede ângulo pela distância **circular**, a que dá a
volta em 360. O campo `angle` da §14.1 não pode entrar nela: o leiame do P-001
diz que um leitor que reduz o ângulo para `−180..180` **falha o caso**, e
`251.145834` contra `−108.854166` são exatamente 360 de diferença — com a
distância circular esse leitor **passaria**. Todo campo sob `/particles/` usa a
tolerância reta de posição, e há um teste que prova a armadilha.

**Onde o programa avisa em vez de improvisar** (regra 21): emissor que precisa
da pose de `t_i` e não a recebeu **não desenha** e diz por quê — usar a matriz
de `t` é o erro de 90° que o P-006 caça; emissor que passou do teto diz quantas
cortou; `mesh` que não aponta para uma malha do mesmo slot avisa
`REF_PARTICLE_MESH`.

**O P-002 passa pelo motivo certo, e há um teste que diz qual.** Ele é de 2ª
fase: a timeline de `rate` é recusada com aviso, `rate` fica no número do anexo
(que é `0`), ninguém nasce, e a lista sai vazia como o `esperado.json` manda.
Não é coincidência, e não é implementação da 2ª fase.

**Testes do runtime Python: 145 → 230.** Conformidade: 71 de 71, sem mudança.
Os seis pontos em que a spec não fecha estão em
`documentos/planos/DESVIOS P3 - runtime Python 2026-09-18.md`, com a leitura,
o motivo e o teste de cada um — e **não** no encargo, para o `P2` não os ler e
o isolamento não morrer.

### v17.8 — Degrau 12, parte `P3`, lote 2: a posição, a forma e a vida — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime Python`, **só pela spec** da extensão.

| O quê | Onde |
|:---|:---|
| A conta fechada da §8, os dois ramos, com `expm1` e o limiar `0.00001` da §3.6 | `recorte/particles.py`, `posicao()` |
| As seis formas da §9.4 — ponto, círculo, retângulo, aresta, **osso** e malha | `ponto_da_forma()` |
| Velocidade, direção e abertura (§9.3), com `spherizeDirection` pelo caminho curto | `avaliar()` |
| Rotação, escala, `scaleOverLifetime`, cor e gradiente (§9.6, §9.7) e o quadro da folha (§9.8) | `avaliar()`, `quadro()` |
| Os dois espaços da §7.2, com a tabela do que a matriz do osso leva junto e em que instante | `avaliar()`, `vivas()` |
| Os campos animáveis **N**: lidos no nascimento, congelados na partícula | `Campos` |

**A régua, medida e não prometida.** O teste que separa este formato de Godot e
Unity não diz "a conta é fechada": ele **integra por passos** a 30 e a 60 quadros
por segundo, mostra que os dois dão pontos diferentes, e mostra que a conta
fechada dá um número só. O outro lado também está medido — a conta fechada
composta consigo mesma dá o mesmo ponto, que é o que deixa o P-008 exigir o
quadro igual bit a bit.

**O preço da conta fechada está num teste, não numa promessa.** A §9.5 escreve
que a gravidade animada é lida no nascimento, e que uma chave nova **não**
entorta as partículas já no ar. Há um teste que prova exatamente isso: as
nascidas antes da chave continuam em linha reta, as de depois caem.

**Sete dos oito casos já batem** pela conta deste runtime — P-001, P-003 a P-008
—, conferidos partícula a partícula contra o `esperado.json`. Falta o bloco
`particles` do `pose-dump` (§14.1), que é o lote 3. O P-002 é de 2ª fase e não
se implementa.

**Seis frases que a spec não fecha** foram escritas nos Desvios do encargo e
subiram ao `PLANEJADOR · dd3937` — nenhuma delas é exercitada por caso nenhum,
e a leitura escolhida está escrita no código e num teste. As principais:
`prewarm` com `startDelay` diferente de zero; como o canal 12 escolhe vértice e
aresta numa malha (a §9.4 só fecha o triângulo); e a ordem entre
`spherizeDirection` e `spread`.

### v17.7 — Degrau 12, parte `P3`, lote 1: o acaso e o nascimento, no runtime Python — 18/09/2026

Pelo `EXECUTANDO · particulas no runtime Python`, **escrito só pela spec**
`formato/extensions/BONE_particles.md` — sem olhar o runtime TypeScript, que
implementa a mesmíssima extensão ao lado. É esse isolamento que prova que a
spec basta; foi assim que se acharam o C-299 e o C-300.

O runtime Python passa a ler o módulo lateral **P**, 1ª fase. Neste lote entram
o acaso e o nascimento:

| O quê | Onde |
|:---|:---|
| O hash PCG de 32 bits e o `acaso(semente, fluxo, indice, canal)` | `runtime-python/recorte/particles.py` (arquivo novo), §3.2 |
| A tabela de canais, congelada, e a faixa `[min, max]` | o mesmo arquivo, §3.3 |
| O anexo `"type": "BONE_particle"`, com os padrões das 12 tabelas da §9 | `recorte/loader.py`, `ParticleAttachment` |
| Quando nasce: taxa fixa com `emitting` liga/desliga, rajadas com `probability` por partícula, pré-aquecimento com índice negativo, e o laço trazendo as voltas de trás | `recorte/particles.py`, §4, §5, §6 |
| A timeline prefixada `BONE_particle` e as 17 propriedades animáveis da §9 | `recorte/loader.py`, `PARTICLE_PROPERTIES` |

**Os cinco números de referência da §3.2 batem, bit a bit**, refeitos nesta
máquina e não copiados: `pcg(0)`, `pcg(42)`, `pcg(0xFFFFFFFF)`,
`acaso(42, 0, 7, 0)` e `acaso(42, 0, −3, 0)`. É a primeira coisa que um leitor
que declara P tem de provar, e é o primeiro teste do arquivo.

**Em Python, inteiro não transborda sozinho.** Toda conta de 32 bits leva
`& 0xFFFFFFFF` escrito. Um esquecido daria números que batem nos primeiros
casos e divergem nos últimos — e o índice negativo entra por complemento de
dois, que é o mesmo `& 0xFFFFFFFF`: é ele que faz `acaso(42, 0, −3, 0)` ser
`0.5181800723075867` e não `0.350787878036499`.

**Três coisas que o leitor AVISA em vez de improvisar** (regra 21 da casa, §7.4
da extensão):

| Situação | O que faz |
|:---|:---|
| `shape` desconhecida | **Não desenha o emissor** e avisa. É a única que não cai para um padrão: um ponto inventado na origem o usuário não tem como notar |
| `space`, `sortMode`, `frameMode`, `meshMode` desconhecidos | Caem para o padrão declarado **e avisam** |
| `rate` com chaves | A timeline é **recusada** com aviso: animar a taxa é o ramo `linear` da §4.2, que é **2ª fase**. Desenhar uma taxa que nunca mudou seria um verde falso |

**Uma frase que a spec não fecha, e a leitura escolhida:** a §6 diz que sem laço
os nascimentos são os de `[−prewarm, t]`, e a §9.1 diz que `startDelay` é o
ponto a partir do qual há nascimento. Com `startDelay: 0` — que é o caso do
P-004 — as duas dizem a mesma coisa. Com um atraso elas se cruzam, e aqui
`prewarm` conta a partir do começo do **próprio emissor**, que é o `startDelay`:
é a leitura que deixa as duas frases verdadeiras ao mesmo tempo. Está escrita no
código, num teste e nos Desvios do encargo, e subiu ao Planejador.

### v17.3 — Degrau 12, parte `B`, lote 2: as quatro animações de fábrica — 18/09/2026

Pelo `EXECUTANDO · biblioteca de animacoes`. 🗣️ *"o que você acha do Mixamo?"* —
e a resposta da pesquisa: *"o que o Mixamo realmente vende não é a tecnologia, é
a biblioteca"*.

**As quatro estão prontas**, em `formato/rigs/humanoide-v1-animacoes.bone`,
gravadas contra a convenção de nomes `formato/rigs/humanoide-v1.bone` (§4.8,
§14.4). O arquivo da convenção **não mudou**: o `animations: []` dele é vazio de
propósito, e o `extras` dele já anunciava que as de fábrica viriam num arquivo
gravado *contra* ele.

| Animação | O que é |
|:---|:---|
| **parado** | duas respirações em 2 s, repetindo. O quadro em que o personagem espera |
| **andar** | o ciclo de quatro poses em 1 s, repetindo: contato, passagem, contato, passagem |
| **correr** | o mesmo ciclo em 0,6 s, com amplitude maior e o tronco inclinado, repetindo |
| **pular** | 0,9 s e **não repete**: agachar, empurrar, subir, cair e pousar. Um pulo que volta ao começo sozinho vira um pula-pula |

**Onde elas aparecem, e por quê — os três programas, olhados no disco antes de
decidir** (regra 9 da casa, e a fonte de cada linha está nos Desvios do encargo):

| Programa | O que ele faz |
|:---|:---|
| **Spine** | `File → Import → Project`, com **Animation** e *"Import into an existing skeleton"*. Não há prateleira: a importada entra na **lista normal** |
| **Spriter** | **não tem biblioteca e não importa animação.** A *Animation palette* lista só as do projeto; reaproveitar é `Ctrl+C` na mão |
| **DragonBones** | a biblioteca dele é a de **recursos** (imagens). O painel Animações tem só *nova · clonar · renomear · apagar* |

**Segue o Spine**, que é o único dos três que faz a coisa que ele pediu: um
botão em ícone na janela Animação (**Biblioteca de animações**, com o nome na
dica) mais **Animação → Biblioteca de animações…**, e o que chega aparece na
mesma janela, numa seção **De fora**, com o nome do arquivo.

**O que é nosso, e não é de nenhum dos três:** a lista do que este corpo **não
tem** aparece por extenso **antes** de trazer, e o fator de tamanho aparece como
número — `k = 2,000`, e não "vai ficar bom". O Spine deixa a timeline órfã cair
calada.

**Trazer grava o arquivo, e a janela diz isso.** O `assets.animations` é um
caminho relativo ao `.bone` do projeto (§2.8): um uri apontando para dentro do
editor não existe na máquina de quem for rodar o jogo. Então trazer é gravar o
arquivo onde a pessoa escolher e citar **o nome com que ele foi gravado**.
Fechar a janela de gravar não traz nada, e o rodapé conta.

**A regra 21 na seção "De fora".** `assets.animations` guarda **uris**; os nomes
moram no arquivo de fora, e quem os copia é o leitor, ao carregar. De um `.bone`
aberto que já citava um arquivo externo, o editor **não sabe** que animações são
aquelas — e a linha escreve isso (`?` e a palavra "não aberto"), em vez de
mostrar zero e parecer uma importação que não pegou. Os nomes do que passou
pelas mãos do editor nesta sessão ficam num **mapa de sessão**, como o
`fromOutside` de `io/open-save.ts`, e **não** num campo novo do
`RECORTE_editor_state`: o arquivo de fora pode mudar no disco, e um nome gravado
no documento passaria a mentir.

**As provas das quatro, porque caso de conformidade não cobre o que o projeto
publica:** o arquivo passa no validador; o `rig` dele é **exatamente** o que o
conteúdo pede (a mesma conta do editor, senão seria L2 `RIG_INCOMPLETE` no
arquivo que serve de exemplo a todo mundo); nenhum nome de osso falta contra a
convenção; o runtime as junta ao corpo e **as poses de fato se mexem** entre 0 e
a metade; e parado, andar e correr **fecham o ciclo** — o fim é igual ao começo,
bit a bit, senão cada volta daria um tranco.

**Provas:** `npx vitest run` **3.426** (3.396 verdes, 29 pulados, 1 vermelho
pré-existente do manual, de 15/09, que não é deste lote) · `tsc` limpo ·
`programa/` montado. **A suíte não é só desta parte**: o `P1` e o `C` estão
gravando na mesma casa, e a conta inteira traz os testes deles junto. Desta
parte são **+17** neste lote (8 em `exportar-e-importar`, 9 em `animando`) e
**+21** no lote 1. Roteiro e medição **não rodados**: portas fixas, e o
Planejador os roda no fecho da rodada, com a casa vazia.

---

### v17.6 — Degrau 12, parte `P1`: o `RIG_INCOMPLETE` passa a valer no arquivo solto — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, por decisão do Planejador **depois da
medição** — e a ordem dele foi essa: *"não adivinhe a minha preferência: meça e
responda."*

Na v17.5 o `RIG_INCOMPLETE` só era medido num arquivo que outro carregava como
externo, nunca num arquivo solto, para não encher de aviso quem só traz a linha
do contrato (a §4.8 diz que um `rig` num esqueleto comum é *"permitido e
inerte"*). O outro lado pesava mais: **um `rig` incompleto num arquivo que vai
ser distribuído faz o hospedeiro aplicar menos do que devia, em silêncio.** O
hospedeiro não tem como reclamar do que o rig não citou, e quem publicou nunca
descobre.

**A medição, antes de escrever uma linha:**

| O que se mediu | Número |
|:---|---:|
| `.bone` varridos no projeto (fora `backup/` e `node_modules/`) | **110** |
| Com bloco `rig` | **12** |
| **Acusados pela regra candidata** | **0** |

E a prova de que o zero vale alguma coisa — uma regra que nunca acusa nada
também daria zero: com o defeito **plantado** (tirar `tronco` do `rig` de
`rigs/humanoide-v1-animacoes.bone` sem tirar a timeline que o anima), a conta
acusa `tronco`. É exatamente o que o chat `B` conferiu **à mão** ao fazer as
quatro animações de fábrica — *"senão seria `RIG_INCOMPLETE` no arquivo que
serve de exemplo a todo mundo"* — porque o validador não conferia. Agora
confere.

**O desconto é o que mata o falso positivo, e ele é diferente por tipo:**

| O que se desconta | Por quê |
|:---|:---|
| Ossos `skinRequired` | Viajam com a pele (§2.8): o hospedeiro não precisa tê-los |
| Slots locais | Idem — entram no fim do array do corpo. É o `rigs/lobisomem-rabo.bone` |
| **Osso comum: NÃO se desconta** | Os `bones` de um arquivo de animações são **ignorados** na importação. O arquivo parece são sozinho — o osso está lá dentro — e chega quebrado no hospedeiro. **É aí que mora o defeito** |

A medição ficou presa em teste: ele varre o projeto e falha dizendo **qual**
arquivo, se alguém gravar um `rig` incompleto. E um teste da v17.5 foi
**reescrito, não apagado** — ele provava que o arquivo solto era poupado, e essa
decisão mudou.

Suíte **3.496** (3.466 verdes, 29 pulados, 1 vermelho antigo do manual) ·
`tsc` limpo · conformidade **71/71** · `--todos` sem erro e **sem nenhum**
`RIG_INCOMPLETE` · 32 testes em `rig-no-validador.test.ts`.

### v17.5 — Degrau 12, parte `P1`, lote 4: o validador passa a conferir o `rig` — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`, sobre achado do chat `B`. Não é
partícula: é um buraco que apareceu no caminho e entrou na cerca.

A §4.8 diz, com todas as letras: *"O validador (12.3) **DEVE** conferir o `rig`
de um arquivo externo contra o hospedeiro quando tem os dois em mãos, e listar
cada nome que falta."* **Ele não conferia.** Quem validava pela linha de comando
um `.bone` que usa animação de fábrica recebia **verde** e nenhuma palavra sobre
os nomes que não batiam. É a regra 21 na cara que mais dói: as outras duas
enganam quem usa; esta engana a nós.

**Os quatro achados, conferidos no disco um a um:**

| O que se achou | Confirmado |
|:---|:---|
| `RIG_UNMET` não existia no validador — só nos dois runtimes | sim |
| `RIG_INCOMPLETE` não existia em **código vivo nenhum**, nem no runtime. Só num comentário de teste do editor | sim — e **nem na tabela da §12.3**, embora a §4.8 o nomeie |
| O validador carregava só os corpos citados por chave `body`; **nunca lia** `assets.animations` nem `assets.skins` | sim |
| O `rig` no núcleo só servia de **exceção** (§4.7), nunca de exigência conferida | sim |

**O que entrou:**

| Código | Nível | Quando |
|:---|:---:|:---|
| `RIG_UNMET` | L2 | **Cada** nome de `rig.bones`/`rig.slots` de um externo que este corpo não tem — um aviso por nome, com o nome escrito, porque a §4.8 pede *listar*, não *avisar*. Mais o osso de `rig.reference` que falta ou tem `length` zero (§2.8): sem ele o ajuste vira `k = 1` e a animação entra do tamanho errado |
| `RIG_INCOMPLETE` | L2 | O `rig` de um externo cita **menos** do que o arquivo usa. Os `bones` de um arquivo de animações são **ignorados** na importação (§2.8): um alvo de timeline que o `rig` não lista é um nome que o hospedeiro precisa ter e ninguém declarou |
| `RIG_REFERENCE` | L1 | `rig.reference.length <= 0`. Faltava no validador também, e a §12.3 já o listava |

E o `validar.mjs` passa a **ler** `assets.animations` e `assets.skins` do disco e
de dentro do `.bonez`, do mesmo jeito que já lia os corpos das chaves `body`.
Sem isso ele nunca tinha os dois em mãos, e a regra não tinha como existir.

**Onde eu me segurei, e por quê.** O `RIG_INCOMPLETE` é medido **só** num
arquivo que outro carrega como externo, nunca num arquivo solto. A §4.8 diz que
um `rig` num esqueleto comum é *"permitido e inerte"* — documentação e nada
mais. Acusá-lo de incompleto encheria de aviso todo arquivo que traz a linha do
contrato, e aviso que não vale nada é a mesma doença por outro lado. Num externo
não há dúvida nenhuma, e é lá que ele fala.

**Um falso positivo foi caçado antes de nascer.** A `rigs/lobisomem-rabo.bone`
preenche os slots `rabo` e `rabo_ponta` e **não** os declara no `rig` — e está
certa: ela **traz** esses slots, que entram no fim do array do corpo (§2.8). A
regra só acusa o slot que a pele preenche e **não traz**. Há teste para os dois
lados.

`RIG_INCOMPLETE` entrou na tabela da §12.3, onde a §4.8 o nomeava e ele não
estava.

Suíte **3.489** (3.459 verdes, 29 pulados, 1 vermelho antigo do manual) ·
`tsc` limpo · conformidade **71/71** · exemplos `--todos` sem erro e sem falso
positivo · 25 testes novos em `ferramentas/testes/rig-no-validador.test.ts`.

### v17.4 — Degrau 12, parte `P1`, lote 3: os oito casos de partícula, em `casos-pendentes/` — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`. Os oito casos P-001 a P-008 da
extensão `BONE_particles`, cada um com entrada, esperado e um leiame que mostra
a conta passo a passo e diz **o que falha ali** e como o erro aparece na suíte.

**Eles ficam em `conformidade/casos-pendentes/`, e o executor não varre essa
pasta:** `node ferramentas/conformidade.mjs` continua dizendo **71 de 71**. Eles
entram em `casos/` quando os **dois** runtimes passarem, e quem os move é o
Planejador.

| Caso | O que prova |
|:---|:---|
| **P-001** posição fechada | A posição é conta da idade, não soma de passos. 11 partículas em `t = 0.5`, com gravidade, arrasto, giro e escala |
| **P-002** taxa em rampa | A inversa **estável** da integral — a que não divide por `s`. **2ª fase**, e a lista do esperado está vazia de propósito |
| **P-003** laço | Em `t = 0.02` já há partículas da volta anterior; `t` e `t + D` dão o mesmo quadro |
| **P-004** pré-aquecimento | Índice **negativo** no hash, por complemento de dois: `acaso(42, 0, −3, 0)` contra `acaso(42, 0, 3, 0)` |
| **P-005** teto de vivas | `maxParticles 5` com 12 vivas: as cinco **mais novas**, e o nascimento nunca é bloqueado |
| **P-006** `space: "world"` | O osso gira 90° entre `t_i` e `t` e a partícula não gira junto: **`(100, 0)`, não `(0, 100)`** |
| **P-007** rajada com probabilidade | Sorteio por partícula, canal 11, no fluxo da rajada: nascem **6 de 10** — não cinco, e meia probabilidade não é metade |
| **P-008** arrastar para trás | `0.9 → 0.3 → 0.9` devolve o primeiro quadro, **igual campo a campo**. É a régua inteira em três linhas |

**Os números foram refeitos, não copiados.** Duas implementações independentes
escritas só pela spec, uma em JavaScript e uma em Python, campo a campo: mesmo
bit. Os cinco números de referência do hash saíram das duas também. Isso **não
basta**, e está escrito no leiame da pasta: duas implementações do mesmo autor
erram junto. Os `P2` e `P3` refazem tudo, sem um olhar o outro.

**Escrever os casos rendeu três linhas novas à spec da extensão** — e é
exatamente a regra de empate funcionando **antes** de custar um caso, em vez de
depois, como custou o C-299 e o C-300:

| O que a spec não dizia | Onde ficou |
|:---|:---|
| **Quantos nascimentos tem uma volta.** `0 <= i < E(D)`. Com `E(D)` não inteiro, o último de uma volta e o primeiro da seguinte ficam mais perto que `1/rate` — é o preço da emenda, e agora está escrito | §6 |
| **O que a matriz do osso leva junto, e em que instante.** Uma tabela de cinco linhas: em `local` o osso continua mandando depois do nascimento; em `world` ele solta a partícula em `t_i` e nunca mais a toca | §7.2 |
| **O formato do dump**, `measure: "particles"`. O `pose-dump` não tinha como falar de partícula. `x` e `y` são **sempre no espaço do esqueleto**, nos dois `space` — é o que torna o P-006 comparável; e o ângulo sai em graus **não** reduzidos | §14.1 |

A medida `particles` no `pose-dump` é de `ferramentas/src/conformidade/`, que é
cerca do chat do runtime TypeScript: os casos são o **contrato** que ele cumpre,
e por isso o formato foi escrito antes.

Suíte **3.464** (3.434 verdes, 29 pulados, 1 vermelho antigo do manual) ·
`tsc` limpo · conformidade **71/71** · validador aprova os oito `entrada.bone` ·
38 testes novos, 86 no arquivo da parte.

### v17.2 — Degrau 12, parte `P1`, lote 2: o validador aprende partícula, e `extensionsUsed` deixa de ser decorativo — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`. Os cinco códigos que a Parte 2 §4.3
propôs, mais a conferência de `extensionsUsed` e `extensionsRequired` que a §2.7
manda. Num lugar só, `site/validador/nucleo.js`, de onde a página e a linha de
comando leem — elas não podem divergir.

| Código | Nível | O que pega |
|:---|:---:|:---|
| `RANGE_PARTICLE_MINMAX` | L1 | Faixa de trás para frente (`lifetime`, `speed`, `angle`, `angularVelocity`, `scale`, `startFrame`). O sorteio é `min + (max − min) × u`: com a faixa invertida ele anda para o lado errado |
| `RANGE_PARTICLE_RATE` | L1 | Taxa negativa — **no anexo e em qualquer chave**. Só o campo parado esconderia uma chave em −3 |
| `RANGE_PARTICLE_RATE_CURVE` | L2 | Bézier numa chave de taxa. A integral só é exata com `linear` ou `stepped` |
| `REF_PARTICLE_MESH` | L1 | `mesh` que não é um anexo `mesh` **do mesmo slot**. A malha de outro slot está presa a outro osso |
| `LIMIT_PARTICLE_COUNT` | L2 | `rate × lifetime.max` acima de 10 000 vivas. Olha a **maior** taxa das chaves, não o número parado |

**`extensionsUsed` era decorativo, e virou regra.** A §12.3 diz que
`EXT_REQUIRED_NOT_USED` é **L1**, e o que existia era um **aviso sem código** —
e aviso deixa o arquivo passar por válido. Agora são dois erros, não um:

- um nome em `extensionsRequired` que não está em `extensionsUsed`;
- **o arquivo usar uma extensão e não a listar.** Este é o que morde: um leitor
  decide o que consegue mostrar lendo `extensionsUsed`. Um `.bone` com um anexo
  `BONE_particle` e a lista vazia diz a todo leitor *"não tem nada aqui"* e
  depois lhe entrega um tipo que ele não conhece. O uso é achado de três jeitos:
  pelo anexo prefixado, pela timeline prefixada e por qualquer bloco
  `extensions.<nome>` em qualquer objeto.

E `EXT_UNREGISTERED` (L2) entrou, lendo os nomes da tabela do
`formato/extensions/REGISTRY.md` — o registro que a própria §2.7 cita. **Sem a
lista em mãos, nenhum L2 sai:** não ter o registro não é o mesmo que o nome não
estar nele, e um aviso inventado aí seria um palpite.

Na spec: as cinco linhas de fallback da `BONE_particles` entraram na tabela da
§2.5, e os seis códigos novos (os cinco de partícula mais o `EXT_SCHEMA` da
v17.1) na tabela da §12.3.

**Um teste foi reescrito, não apagado.** O da v17.1 provava que `rate: -5`
passava sem o registro de extensões; o `RANGE_PARTICLE_RATE` deste lote é regra
semântica e não precisa de registro, então aquilo deixou de ser verdade. O teste
passou a provar a mesma coisa com um defeito que **só** o schema da extensão
pega — um `space` que não existe.

Suíte **3.426** (3.396 verdes, 29 pulados, 1 vermelho antigo do manual) ·
`tsc` limpo · conformidade **71/71** · 26 testes novos, 48 no arquivo da parte.

### v17.1 — Degrau 12, parte `P1`, lote 1: a extensão `BONE_particles` no formato — 18/09/2026

Pelo `EXECUTANDO · particulas no formato`. 🗣️ *"partícula é para ter no
programa"*. **Nenhum dos três programas de referência tem**: mandam um evento e
o jogo solta a partícula. Este lote é só o formato — nenhum runtime foi tocado.

**A régua, e é ela que decide tudo o mais:** o quadro em `t` é **função pura** de
(arquivo, animação, `t`). Godot e Unity simulam para frente, e arrastar o cursor
para trás não devolve o mesmo quadro. Aqui devolve. Daí sai o resto: o acaso é
`hash(semente, fluxo, i, canal)` com PCG de 32 bits; a posição é conta fechada da
idade, com `expm1` para o arrasto; o limite de vivas desenha as mais novas em vez
de bloquear o nascimento (bloquear é estado); a semente é **sempre fixa**.

**O que entrou:**

| Arquivo | O quê |
|:---|:---|
| `formato/extensions/BONE_particles.md` | A spec da extensão: a régua, o hash com os cinco números de referência, a tabela de canais congelada, as contas de nascimento e de posição, os campos um a um, o fallback, os limites, os oito casos |
| `formato/extensions/BONE_particles.schema.json` | O JSON Schema, que a §2.7 exige do autor de toda extensão |
| `formato/exemplos/particulas.bone` | O emissor de fumaça do cachimbo, que o `npm run validar -- --todos` passa a conferir |
| `formato/extensions/REGISTRY.md` | A linha da extensão, mais **a convenção de nome de arquivo**, que não existia escrita |

**Dois buracos do schema, que o encargo mandou não resolver no escuro:**

O primeiro **não era buraco**: `"BONE_particle"` já passava. O `attachmentType`
é um `anyOf` de dois ramos — o `enum` fechado dos oito tipos do núcleo **e** o
`coreOrExtensionType`, que é o regex de nome da §2.7. Conferido no disco, e com
teste escrito para ninguém ter de reconferir.

O segundo **era**, e é o que mais dói: a §12.7 manda *"extensões registradas
trazem o seu schema e o validador o aplica pelo nome"*, e **ninguém aplicava**.
O `definitions/extensions` conferia o **nome** da chave e que o valor era um
objeto, e parava aí. Um emissor com `rate: -5`, `shape: "triangulo"` e
`seed: -1` recebia **verde**. É a regra 21 na terceira cara, a que engana a nós:
a prova dizendo que está tudo bem quando não olhou.

**Agora é aplicado, num lugar só:** `checarExtensoes` no `site/validador/nucleo.js`
recebe um registro **nome da extensão → schema** e o usa sobre cada
`extensions.<nome>` e sobre cada anexo de tipo prefixado. A linha de comando
monta o registro com Ajv lendo `formato/extensions/*.schema.json`; a página
recebe os mesmos schemas compilados à frente do tempo pelo
`construir-esquema.mjs`, em `extensoes-compiladas.js`. **O schema diz de si
mesmo o que descreve** (`x-extension`, `x-attachment-types`), então uma extensão
nova entra no validador sem uma linha de código.

**A 1ª fase é só o que o `07` lista:** taxa liga/desliga (`emitting` animável,
`rate` fixo), uma semente por emissor, mistura só pelo slot, gravidade zero.
Nada de sub-emissor, rastro ou ruído. **A conta da taxa vai escrita inteira
assim mesmo**, os dois ramos, com o ramo linear marcado "2ª fase" — decisão do
Planejador, e o motivo é o C-299 e o C-300: spec que cala é spec que vai ser
adivinhada, e dois runtimes adivinham diferente.

Suíte **3.383** (3.353 verdes, 29 pulados, 1 vermelho antigo do manual, de
15/09) · `tsc` limpo · conformidade **71/71** nos dois runtimes · 22 testes
novos em `ferramentas/testes/particulas.test.ts`.

### v17.0 — Degrau 12, parte `B`, lote 1: Exportar animação e Importar animação — 18/09/2026

Pelo `EXECUTANDO · biblioteca de animacoes`. 🗣️ *"o que você acha do Mixamo?"* —
sair com animações prontas que caiam em qualquer personagem da convenção de
nomes.

**O formato e os dois runtimes já faziam tudo isto, e nada aqui os refez.** A
§2.8 `assets.animations` copia as `animations` de um `.bone` externo para este
esqueleto pelo nome; a §4.8 `rig` é o contrato do que o arquivo exige do
hospedeiro; nome que não bate é um aviso L2 `RIG_UNMET` por nome e **o arquivo
abre**; o `rig.reference` ajusta o tamanho. Os casos C-275, C-276, C-277,
C-279, C-294 e C-297 passam nos dois runtimes desde o degrau 2.

**O buraco era só a tela.** O editor exportava e importava PELE
(`io/export-skin.ts`) e não exportava nem importava ANIMAÇÃO: nenhum arquivo de
`editor/src/io/` escrevia `assets.animations`.

| O quê | Onde |
|:---|:---|
| **Exportar animação…** (menu Animação) | as animações marcadas saem num `.bone` com o `rig` **gerado do conteúdo** — todo alvo de timeline `bone`, e os alvos de `slot`, `deform`, `weights` e `sequence` (é o que a §4.8 manda um gravador fazer) — e com o `rig.reference` da convenção do corpo |
| **Importar animação…** (menu Animação) | o uri entra em `assets.animations`, e **a lista do que este corpo não tem aparece na tela, por extenso, ANTES de aplicar**; quem disser que não deixa o arquivo como estava |
| O arquivo que sai | só as animações e **a raiz pelada**: `bones` é obrigatório (2.2), mas a §2.8 ignora o corpo de um arquivo de animações, e levar o esqueleto inteiro faria quem o abrisse pensar que ele traz um corpo |
| O que fica de fora | os eventos e as regras que as timelines citam aparecem no relatório **por extenso** — a §2.8 os ignora, e quem exporta tem de saber disso antes de mandar o arquivo a alguém |

**A regra 21, escrita em três lugares desta tela.** O arquivo sem osso de
referência sai sem `rig.reference` e a janela **diz** que a animação vai entrar
no tamanho em que foi gravada, em vez de deixar passar calado; o fator de
tamanho aparece na tela antes de importar (`k = 2,000`, e não "vai ficar bom");
e um `.bone` sem animação nenhuma é recusado com a razão dita, em vez de entrar
mudo na lista.

**E um achado que subiu ao Planejador, e que não é nosso para consertar:** o
`ferramentas/validador/validar.mjs` e o núcleo dele (`site/validador/nucleo.js`)
**não conferem o `rig`** — `RIG_UNMET` não aparece em nenhum dos dois, e
`RIG_INCOMPLETE` não existe em lugar nenhum do código vivo. O validador carrega
arquivos externos, mas só os corpos citados por chave `body` (9.13): nunca tem
hospedeiro e externo em mãos ao mesmo tempo, que é a condição da §4.8. Virou o
**lote 4 do `P1`**. Até ele fechar, **esta janela é o único lugar onde alguém vê
que um nome de osso não bate**.

**Provas:** `npx vitest run` **3.361** (3.331 verdes, 29 pulados, 1 vermelho
pré-existente do manual, de 15/09, que não é deste lote) · `tsc` limpo ·
`programa/` montado.

---

### v16.9 — Fecho do degrau 11 (a casca) pelo Planejador, e passagem de bastão — 18/09/2026

Pelo `PLANEJADOR · animador-5e`. O executor `EXECUTANDO · a casca` fechou os
oito lotes (v16.0 a v16.7) e os documentos (v16.8); esta é a conferência, com
ele parado, e a última versão desta janela: a próxima rodada (D12, o glacê) é
do `PLANEJADOR · dd3937`.

**Provas, rodadas pelo Planejador** (18/09, 10:40, nada gravado em `editor/src`
nos cinco minutos anteriores): `npx vitest run` **3.340** (3.310 verdes, 29
pulados, 1 vermelho pré-existente do manual, 15/09) · `tsc` limpo ·
conformidade **71 de 71** nos dois runtimes · roteiro **14 de 14** · medição
**26 de 26** de lado e **19 de 26** de altura, **com os painéis cheios** ·
`programa/` montado pelo executor na v16.7, e nada mudou depois.

**O número honesto piorou, e fica dito:** medida com o desenho escolhido e a
animação aberta, a aba Propriedades passa da coluna em 265 px (eram 68) e a
Malha e pesos em 567 px (eram 445), em 1440×900. A conta "19 de 26" ficou
igual por coincidência: quatro falsos verdes passaram a ser medidos de verdade,
e cabem.

**Uma pergunta que sobe ao Humberto:** as teclas de painel (linha do tempo,
Ordem, Árvore) já trocam pelo modelo, mas não têm linha na janela Ajuda →
Atalhos; pô-las lá dobra a lista. Entram, ou ficam de fora?

**Fica para depois, escrito nos Desvios do encargo:** criar grupo novo na
coluna ao soltar na borda; as teclas fixas (Espaço, setas, 7890, P) pela
tabela de troca; a Janela de Problemas listar problemas de outra natureza
(osso sem imagem, animação vazia); `fotos-manual.mjs`, que ainda procura a
classe da Montagem (é do D13).

### v16.7 — Degrau 11, lote 8: a medição mede o painel CHEIO — 18/09/2026

Pelo executor `EXECUTANDO · a casca`. Defeito A10, e é a regra 21 virada
contra a nossa própria prova.

**O que estava errado.** `npm run medir` abria o herói e media as treze abas.
Quatro delas não tinham o que mostrar: **Imagens**, **Entidades** e **Pivôs**
diziam *"Nenhuma pasta aberta"*, e o **Histórico** tinha um passo só. Um
painel que mostra uma frase no lugar do conteúdo **cabe sempre** — eram oito
medições verdes que não provavam nada. É a mentira número 1 do cabeçalho da
prova, consertada em 13/09 para a aba Malha e voltando por outra porta.

**O que a prova faz agora:**

- **Enche antes de medir**: abre uma animação, põe todas as peles na pilha,
  mexe três vezes (para o Histórico ter passos) e **adota uma pasta de
  imagens**. A pasta entra pela *Trocar pasta de origem* (degrau 8), e não por
  *Abrir pasta…*: esta abriria um projeto novo e levaria o herói junto — uma
  prova não pode esvaziar um painel para encher outro.
- **Painel vazio não conta como medido**: ele sai no relatório como `VAZIO`,
  com o motivo, e entra numa lista no fim. O número honesto cai.
- **A frase só conta quando está no lugar do conteúdo** (menos de 160 px de
  painel): a aba Imagens diz *"Nenhuma pasta aberta"* na linha da pasta e
  mostra a grade cheia embaixo — ali a frase é recado, não painel vazio.
- **O painel medido é o DAQUELA aba**: o detector lia o primeiro `.painel-corpo`
  da coluna e chegou a dizer *"Imagens mostra Nenhuma entidade"* — o texto do
  vizinho, debaixo do nome errado. É o mesmo engano que já tinha posto o
  conteúdo da Exibição debaixo do nome "Prévia".

**Os números novos, com os painéis cheios — e eles pioraram:**

| Medida | Antes (com painel vazio) | Agora (painel cheio) |
|:---|:---|:---|
| De lado | 26 de 26 | **26 de 26** |
| De altura | 19 de 26 | **19 de 26** |
| Propriedades, 1440×900 | faltavam 68 px | **faltam 265 px** |
| Propriedades, 1280×720 | faltavam 190 px | **faltam 387 px** |
| Malha e pesos, 1440×900 | faltavam 445 px | **faltam 567 px** |
| Malha e pesos, 1280×720 | faltavam 567 px | **faltam 689 px** |
| Exibição | 71 / 193 px | **71 / 193 px** (não mudou) |
| Prévia, 1280×720 | faltavam 8 px depois do palco | **faltam 8 px** (não mudou) |

A conta de "quantas cabem" ficou igual por coincidência: as quatro medições
que eram falso verde passaram a ser medidas de verdade **e cabem**; o que
piorou foi o **tamanho do buraco** nas que já não cabiam, porque agora elas
são medidas com o conteúdo que o Humberto de fato vê — a ficha rápida com a
imagem escolhida, e a malha com a animação aberta.

- Testes: **+5** em `paineis`. Suíte **3.340**. `tsc` limpo. Roteiro 14/14.
- Fotos: `backup/fotos-degrau-11/lote-8_antes.png` e `_depois.png` — o
  relatório da prova, antes e depois.

### v16.6 — Degrau 11, lote 7: o rascunho que falha avisa, e Cancelar não apaga — 18/09/2026

Pelo executor `EXECUTANDO · a casca`. Defeitos A1 e A2.

- **A1 — o rascunho que não grava AVISA.** Quando o navegador nega ou não há
  espaço, o rascunho automático falhava **calado**, e quem trabalhava seguia
  acreditando que havia uma rede embaixo. Agora o rodapé diz: *"O rascunho
  automático não pôde ser gravado… o que você fizer daqui para a frente NÃO
  será recuperado se a aba fechar: salve com Ctrl+S."* Uma vez, e não a cada
  trinta segundos — recado repetido vira ruído e deixa de ser lido. Voltando a
  gravar, o aviso pode acontecer de novo.
- **A2 — a janela de recuperar tem os botões escritos, e Cancelar não apaga.**
  Era um `confirm` do navegador, com **OK** e **Cancelar** — e **Cancelar
  apagava o rascunho**: o botão que em toda parte quer dizer *"não faça nada"*
  era o que destruía o trabalho, sem volta. Agora são três caminhos, cada um
  com o nome do que faz e a frase do que acontece:
  **Recuperar este trabalho** · **Agora não — guardar o rascunho** ·
  **Apagar o rascunho** (o único que apaga, e ele diz *"Não tem volta"*).
  **Esc e o clique fora são "agora não"**: fechar a janela nunca apaga.
- O rascunho que **não abre** também não é mais apagado sozinho: a janela diz
  que ele continua guardado e por onde se apaga.
- Janela nova em `ui/dialog.ts`: `askChoice`, com `cancelId` escrito — é o
  campo que impede o erro do A2 de voltar.
- O **roteiro** foi reescrito no passo 14: ele agora escolhe "Agora não" na
  janela do programa e **confere que o rascunho ficou**. O A2 passou a ser
  provado no programa de verdade, e não só no teste.
- Testes: **+8** em `documento`. Suíte **3.335**. `tsc` limpo. Roteiro 14/14.
- Fotos: `backup/fotos-degrau-11/lote-7_antes.png` e `_depois.png`.

### v16.5 — Degrau 11, lote 6: a Janela de Problemas — 18/09/2026

Pelo executor `EXECUTANDO · a casca`. A regra 21 com tela.

- **A barra de avisos abre uma janela.** Uma linha por problema, o que está
  errado **escrito por extenso**, **Ir para** com o nome do lugar (*"Ir para
  pele "default" › desenho "cape_upper" › path"*) e, **onde há conserto, o
  botão com o nome dele** — *Trocar imagem…*, *Gravar o padrão* — mais a frase
  que diz o que o conserto vai fazer. Na tira do rodapé os dois botões eram
  ícones, e o nome do conserto só aparecia na dica.
- **O pé da janela conta**: *"2 problemas, 1 com conserto aqui. O resto é na
  mão."* Dizer só "2 problemas" esconde justamente o que decide o que fazer.
- **Duas portas**: o botão de avisos, no rodapé, e **Ajuda → Problemas do
  arquivo…** — esta se acha mesmo quando não há aviso nenhum aceso.
- Sem problema nenhum ela diz isso, em vez de abrir vazia.
- A janela repete, em uma linha, a razão de existir: *"Nada disso foi
  adivinhado: o que não se entende vira aviso, nunca um palpite silencioso no
  desenho."*
- Testes: **+6** em `menus`; dois contadores atualizados (`acoes`,
  `exportar-e-ajuda`). Suíte **3.327**. `tsc` limpo. Roteiro 14/14.
- Fotos: `backup/fotos-degrau-11/lote-6_antes.png` e `_depois.png`.

### v16.4 — Degrau 11, lote 5: a tela cheia da Visualização — 18/09/2026

Pelo executor `EXECUTANDO · a casca`. C5.

- **A tela cheia da Prévia leva a lista de animações e as peles dentro.** Três
  colunas: as animações do corpo à esquerda, o palco grande no meio, a pilha
  de peles à direita. Um clique numa animação toca na camada 0; um clique numa
  pele põe e tira. Antes ia só o palco, e para trocar de animação era preciso
  sair da tela cheia — que é o que o Humberto pediu para acabar (Q37).
- **`Esc` volta**, e a caixa vai embora junto: o painel ouve a troca do
  navegador e devolve o palco ao lugar de onde ele saiu.
- **Aqui é teste, e a tela diz isso**: pôr e tirar pele na tela cheia mexe numa
  pilha própria, e **não no arquivo**. Ao sair, a Prévia volta a seguir a pilha
  do documento. Nenhum comando é rodado por esse caminho.
- O palco **cresce** até a altura da tela, sem esticar torto (`object-fit`).
  Antes ele ficava do tamanho de sempre (480×300) no meio de 1440 px — tela
  cheia que não aumenta o personagem não serve para julgar animação.
- Navegador que recusa a tela cheia (permissão negada, quadro sem
  `allowfullscreen`) **não derruba o painel**: a caixa é desmontada e o painel
  fica como estava.
- Testes: **+6** em `previa`. Suíte **3.321**. `tsc` limpo. Roteiro 14/14.
- Fotos: `backup/fotos-degrau-11/lote-5_antes.png` e `_depois.png`.

### v16.3 — Degrau 11, lote 4: arranjos com nome no menu Janela — 18/09/2026

Pelo executor `EXECUTANDO · a casca`. C6, e os dois modos aprovados em 17/09.

- **Janela → Arranjos**: um submenu com os arranjos com nome. Guardar este
  arranjo… (a tela de agora, com o nome que se der), aplicar (um clique no
  nome) e Apagar um arranjo…. **Voltar ao padrão** continua ali: é o desfazer.
- **Pivô** e **Visualização de fábrica**, os dois modos que o Humberto pediu
  (Q37). Pivô: a grade dos pivôs e as imagens grandes, de um lado só. 
  Visualização: a Prévia com as animações e as peles ao lado. **Lugar para uma
  tarefa, nunca freio**: nenhuma ferramenta some, e o que o arranjo não cita
  fica **fechado**, não sumido — o menu Janela traz qualquer painel de volta.
- Os de fábrica são **receita, não fotografia**: montam-se com os painéis que
  existirem. Painel que não existe é pulado; arranjo que não existe mais
  **avisa** em vez de montar uma tela inventada (regra 21).
- Os guardados moram no navegador (`RECORTE_arranjos`), como o tema e a
  arrumação. **Nunca no `.bone`.** Teto de 12, com aviso; nome repetido
  regrava e diz isso; nome de arranjo de fábrica é recusado.
- **Dois consertos que o lote descobriu**, e os dois eram porta prometida e
  não entregue: o menu Janela ficou mais alto que a tela e os últimos itens
  caíam para fora — agora ele **rola**; e uma lista que rola recorta o que sai
  dela, então o **submenu passou a flutuar** (`position: fixed`, posicionado
  pela casca, com volta para a esquerda quando não cabe à direita).
- Modelo puro em `ui/arrangements.ts`.
- Testes: **+13** em `menus`. Suíte **3.315** (3.285 verdes, 29 pulados, o
  vermelho antigo do manual). `tsc` limpo. Roteiro 14/14.
- Fotos: `backup/fotos-degrau-11/lote-4_antes.png` e `_depois.png`.

### v16.2 — Degrau 11, lote 3: colar o painel na quina — 18/09/2026

Pelo executor `EXECUTANDO · a casca`. C1, o encaixe do Photoshop.

- **O painel flutuante cola nas quinas e nas bordas da cena.** Chegou a 24 px
  de uma borda, encosta nela; de duas, encosta na quina. A pessoa não precisa
  acertar o pixel. A régua é a **borda do painel**, e não o ponteiro: a barra
  de título fica em cima, e com o ponteiro a quina de baixo nunca se alcançaria.
- **A sombra aparece antes de soltar**: um retângulo azul tracejado mostra onde
  o painel vai parar, enquanto a mão segura. Vale arrastando a barra de um
  flutuante e arrastando uma **aba** para fora da tira.
- **Fora de toda zona, nada cola**: o painel fica onde foi solto, como sempre.
  Em cima de uma tira de abas, a tira ganha: soltar ali cola na coluna.
- **A quina fica guardada** (`snap`, na arrumação da máquina, nunca no
  `.bone`): a janela muda de tamanho, uma coluna abre ou fecha, e o painel
  continua na quina dele. Arrastá-lo para longe solta a quina. Quina
  desconhecida no que estava gravado não vira palpite: o painel fica solto.
- O rodapé diz *"Histórico colado na quina de baixo, à direita da cena"*. O
  painel colado ganha a borda azul.
- Modelo puro em `ui/panel-groups.ts` (`snapOf`, `snappedBox`, `snapFloat`,
  `setFloatSnap`); a casca só desenha a sombra e aplica.
- Testes: **+9** em `colunas-e-barra`. Suíte **3.302** (3.272 verdes, 29
  pulados, o vermelho antigo do manual). `tsc` limpo. Roteiro 14/14.
- Fotos: `backup/fotos-degrau-11/lote-3_antes.png`, `_depois.png` (a sombra,
  com a mão segurando) e `_depois-solto.png` (já colado).

### v16.1 — Degrau 11, lote 2: o sistema de trocar as teclas — 18/09/2026

Pelo executor `EXECUTANDO · a casca`. G7.

- **Ajuda → Atalhos do teclado agora troca tecla.** Cada linha tem um lápis:
  clicar, apertar a tecla nova, e ela **vale na hora** — no teclado, ao lado do
  item do menu, na paleta de comandos e na dica da ferramenta.
- **A tabela de troca mora na máquina** (`RECORTE_teclas`, no navegador), como
  o tema e o arranjo dos painéis. **Nunca no `.bone`.** Sobrevive a reabrir.
- **A Ajuda mostra as trocadas**: faixa laranja, *"trocada — era Ctrl+S"*, e a
  seta de voltar. **Voltar todas ao padrão** no pé da janela.
- **O conflito avisa e não troca**: *"Ctrl+Z já é de "Desfazer" (em toda
  parte). A tecla não foi trocada."* A régua da troca é mais dura que a de
  fábrica: tecla de painel não repete uma de toda parte.
- **Regra 21:** as teclas que o programa lê direto do teclado (Espaço, setas
  de andar, 7 8 9 0, o P de segurar) aparecem como **fixa**, em vez de fingir
  que trocam; as do navegador (Ctrl+W, F5, Ctrl+Tab…) são recusadas com a
  razão escrita; troca gravada de uma linha que saiu do programa é **contada**.
- `ui/keys.ts` continua sendo a tabela de fábrica (tecla nova = uma linha lá).
  Quem atende tecla passou a ler `liveTable()`. Modelo puro em
  `ui/key-swaps.ts`; a janela em `ui/keys-dialog.ts`.
- Testes: **+13** em `teclas`; dois reescritos (`animando`, `teclas`). Suíte
  **3.293** (3.263 verdes, 29 pulados, o vermelho antigo do manual). `tsc`
  limpo. Roteiro 14/14.
- Fotos: `backup/fotos-degrau-11/lote-2_antes.png` e `_depois.png`.

### v16.0 — Degrau 11, lote 1: o interruptor sai da barra, e o rodapé diz onde se está — 18/09/2026

Pelo executor `EXECUTANDO · a casca`. M4 de vez.

- **O interruptor `Montagem | Animando` saiu da barra**, e o `Ctrl+Tab` saiu
  com ele. Não há modo: há o que está aberto. A barra começa em Arquivo.
- **O rodapé diz onde se está**: *"Base: heroi"* ou *"Animação: andar"*
  (`ui/where-model.ts`, módulo puro). Com a virada de corpo, diz também o
  corpo do instante. A dica do rodapé diz **por onde se troca**.
- **Nada sumiu sem porta.** A base abre com um clique no corpo, na janela
  Animação, ou por **Animação → Abrir a base** (id novo, `abrir-a-base`; cinza
  com a base já aberta, e a dica diz por quê). A animação abre com um clique
  no nome dela. O id `alternar-modo` saiu.
- **`EditorMode` saiu do contrato**, e `modeOf`, `MODE_ITEM`, `MODE_SIDES`, o
  estilo `mode-switch` e o CSS `.viewport-modo` saíram junto.
  `doc.animation === null` continua sendo a base aberta.
- A frase do rodapé ao fechar a animação passou de *"Voltou à montagem"* para
  *"Abriu a base"*.
- Testes: os seis do interruptor (`colunas-e-barra`) foram **reescritos** para
  provar o rodapé e as portas novas, e ganharam dois. Suíte **3.280**
  (3.250 verdes, 29 pulados, o vermelho antigo do manual). `tsc` limpo.
  Roteiro 14/14.
- Fotos: `backup/fotos-degrau-11/lote-1_antes.png` e `_depois.png`. Script
  novo das fotos: `ferramentas/provas/foto-da-tela.mjs`.

### v15.8 — Fecho da rodada dos degraus 8, 9 e 10: a pilha de peles na tela, o projeto no disco, 26 painéis — 18/09/2026

Pelo PLANEJADOR (`PLANEJADOR · animador-5e`). Os três executores fecharam as
suas versões (D10 v14.8, v15.2, v15.6 · D9 v14.9, v15.1, v15.4, v15.5 · D8
v15.0, v15.3, v15.7); esta é a do fecho, com todos parados:

- **A `default` fora da pilha saiu dos dois últimos lugares** em que ainda
  aparecia por fora: a exportação de imagem (v15.6, D10: `freshSkeleton`
  passou de `setSkin` para `setSkinStack` com a pilha do documento) e a ordem
  base da aba Ordem (v15.7, D8: `baseOrder` aplica o `drawOrder` de cada pele
  da pilha, de baixo para cima). Os dois achados são do D9, que não era dono
  de nenhum dos dois arquivos e avisou em vez de consertar.
- **Regra nova, achada pelo D8:** o roteiro monta o código do disco na hora;
  quem grava em `editor/src` durante a prova de outro dá vermelho falso, igual
  a disputar a porta. **Ninguém grava no editor enquanto alguém prova.**
  `find editor/src -newermt "-5 minutes"` responde em um segundo.
- O aplicativo reiniciou no meio da rodada e todos os endereços viraram o
  título da janela; nada se perdeu, porque a peça vive no arquivo.

**Provas do fecho** (18/09, manhã, com os três parados): `npx vitest run`
**3.278** (3.248 verdes, 29 pulados, 1 vermelho pré-existente do manual, 15/09)
· `tsc` do editor limpo · conformidade **71 de 71** nos dois runtimes · roteiro
**14 de 14** · medição **26 de 26** de lado e **19 de 26** de altura · `programa/` montado.

*(O zip da v15.8 foi gravado antes de o `ESTADO`, o encargo e o `QUEM E QUEM` receberem o fecho: o script parou numa linha repetida. A v15.9 é o retrato com os documentos dentro.)*

**Fica anotado para os próximos degraus:** desenhar e editar o `crop` na cena
(D10 deixou fora: não estava na 10.4); copiar o arquivo de fora para a pasta
já na hora de abrir (hoje é referenciado e gravado no Salvar seguinte); soltar
imagens numeradas na janela não cria o anexo sozinho, porque bate com "nada
entra na cena sozinho" (o gesto é o botão direito no cabeçalho da subpasta).

### v15.7 — A ordem base segue a pilha: a `default` que saiu não manda — 18/09/2026

Chat D8, uma linha só, achada pelo D9 no fecho do degrau 9. Nada do runtime foi
tocado.

- **`baseOrder` punha a `default` por fora da pilha, sempre.** Era a leitura
  certa enquanto a `default` estava obrigada a ficar por baixo de tudo; com a
  pilha do degrau 9 (spec §4.4) ela é uma pele como as outras e **pode sair**.
  A conta velha continuava aplicando o `drawOrder` de uma pele desligada, e a
  aba Ordem mostrava uma ordem que a cena não desenhava — uma tela dizendo uma
  coisa e o desenho fazendo outra, que é o defeito da regra 21.
- **Agora vale a pilha, de baixo para cima**, com a `default` dentro quando ela
  está ligada. A Ordem lê a pilha (`orderSkins`), e não o `visibleSkins`: aquela
  é o lápis primeiro e as outras depois, e ler a vista daria a ordem ao
  contrário assim que alguém editasse uma pele que não fosse a de baixo.
- **O teste que teria pegado**: uma `default` com `drawOrder`, fora da pilha,
  não mexe na ordem. Com ele vêm mais quatro, um deles provando que a ordem da
  pilha muda o resultado quando duas peles mexem na mesma peça.

### v15.6 — Degrau 10, conserto: a exportação de imagem segue a pilha de peles — 18/09/2026

Chat D10 (`EXECUTANDO · arquivo`), sobre um achado do D9. Uma linha de código e
um teste; nada do runtime foi tocado.

- **A exportação de imagem desenhava a arte da `default` mesmo com ela FORA da
  pilha.** Ela chamava `setSkin`, a compatibilidade que põe a `default` por
  baixo de tudo **sempre**; desde o degrau 9 a `default` é uma pele como as
  outras (spec §4.4) e **pode sair da pilha** (I10) — é o que o lobisomem faz,
  trocando quase toda a arte do homem. O resultado era uma imagem exportada
  diferente da que a cena mostra: o tronco do homem continuava na figura do
  lobisomem.
- Agora `freshSkeleton` lê `doc.pilha` — **o mesmo campo que a cena e a Prévia
  leem** — e chama `setSkinStack`. Pele que já não existe no arquivo sai da
  lista antes, para uma pele apagada não derrubar a exportação inteira.
- **Por que ninguém tinha pego:** a prova disto não é a arte que a pele TROCA
  (essa a de cima vence de qualquer jeito, pelos dois caminhos), e sim a peça
  que **só a `default` vestia**. O teste novo tem um slot assim, e foi conferido
  ao contrário: com o código velho de volta, ele fica vermelho na asserção do
  tronco.
- Quatro testes novos em `editor/testes/exportar-e-importar.test.ts`.

### v15.5 — Degrau 9, fecho: o que a revisão pegou depois dos três lotes — 18/09/2026

Chat D9 (`EXECUTANDO · peles`). Seis acertos achados relendo o próprio código,
todos com teste. Nada do runtime foi tocado.

- **Pele ligada que este corpo não tem agora é DITA na barra de avisos**, e não
  só na aba Peles (regra 21). Acontece de verdade: o arquivo foi salvo vestindo
  `armadura`, alguém apagou a pele, e ao reabrir o personagem aparecia pelado
  com a aba fechada e nada explicava.
- **O padrão não se escreve**: a pilha só com a `default` e sem lápis deixou de
  ir para o `RECORTE_editor_state`. Sem isso, todo `.bone` do mundo levaria
  dois campos de ruído.
- **A Prévia passou a receber a pilha pura.** Pela conta velha, com a `default`
  fora da pilha, ela mostrava a arte que a cena já não mostra — que é a pior
  coisa que uma prévia pode fazer.
- **Os ouvintes de arrasto deixaram de empilhar.** Eles eram postos a cada
  redesenho, nas duas listas que vivem enquanto o painel vive: depois de dez
  redesenhos, um `drop` corria dez vezes.
- **Soltar no vazio da coluna Ativas também liga.** A mão mira a coluna, não a
  linha; sem isso, metade dos arrastos não fazia nada e parecia defeito do
  mouse.
- **A barra da aba Peles ficou apertada**, como a da Árvore: ela tem sete
  controles desde este degrau, e com o passo padrão ia a três linhas e comia a
  altura das duas colunas.

### v15.4 — Degrau 9, lote 3: a pele de uma pasta, a pele em arquivo, a pele que vira corpo — 18/09/2026

Chat D9 (`EXECUTANDO · peles`), tarefas 9.6, 9.7 e 9.8 do `ARQUITETO 4`. Nada
do runtime foi tocado.

- **Fazer a pele de uma pasta** (I9), como o Spriter: *"trocar uma imagem por
  vez ou a pasta inteira"*. Cada desenho da pele de origem procura, na pasta,
  uma imagem com o **mesmo nome de arquivo** — é a conta por NOME, que é o que
  o Spriter não tem (lá toda variação precisa que o objeto já exista). O grupo
  do PSD chega como pasta, porque o importador grava o nome do grupo na frente
  do nome da imagem: é o mesmo dado, sem caminho separado. **O que a pasta não
  cobre é dito** antes de fechar, e não some em silêncio.
- **Exportar pele…** e **Importar pele…** (I12, F23). São duas coisas com nomes
  parecidos, e agora com dois ids: *Arquivo › Por pele…* **fatia o corpo
  inteiro**; *Esqueleto › Exportar pele…* grava **só a roupa**, num `.bone` com
  `rig` (4.8) e com os ossos, slots e regras `skinRequired` que ela traz — o
  rabo do lobisomem vai junto (§5.2 do `ARQUITETO 3`). O `rig` é gerado do
  conteúdo, como a spec pede de um gravador. Importar põe o uri em
  `assets.skins` (2.8): a pele continua sendo um arquivo, que se troca sem
  reabrir o personagem, e **aparece em Feitas como as outras**, marcada como de
  fora. O que ela exige e este corpo não tem é dito na hora, em português.
- **Promover pele a base** (I13, F25). *"Lobisomem: os dois"* — a pilha ligada
  vira a base de um corpo novo, que entra em **Corpos** com animações próprias:
  os anexos achatados (a de cima vence), os ossos e regras `skinRequired`
  virando comuns, as peles assadas saindo da lista, o `drawOrder` delas virando
  a ordem do array `slots`, e as linhas de tempo que as citavam passando a
  citar a `default`. **Zero campo novo.** O corpo de origem não muda uma
  vírgula, e não é passo de desfazer: é um arquivo a mais no projeto.
- **O id repetido, achado pelo D8 e consertado aqui**: `exportar-pele` era do
  fatiar e passou a ser pedido por dois menus. O do degrau 9 virou
  `exportar-pele-arquivo` (regra 17: uma ação de menu, um id).
- **Dois defeitos que os testes pegaram antes de qualquer pessoa:** o arquivo
  de pele saía sem `minVersion` no cabeçalho, e **não carregava** no runtime —
  o tipo de defeito que só aparece na máquina de quem recebeu; o cabeçalho
  passou a vir do corpo de origem. E o `rig` listava como exigência os ossos que
  a própria pele leva junto.

### v15.3 — Degrau 8, lote 2: trocar a pasta de origem, o PSD pela guia, o painel Pivôs — 18/09/2026

Chat D8 (`EXECUTANDO · imagens, ordem e entidades`), tarefas 8.3, 8.4, 8.5 e
8.7 do `ARQUITETO 4`. Nada do runtime foi tocado.

- **Trocar pasta de origem…** (I4). *"Apontar para outra pasta e trocar todo o
  acervo pelas imagens de mesmo nome"* — Humberto, 16/09. É o character map
  por **nome de arquivo**: o herói de armadura, o herói ferido, a mesma
  montagem. Um só passo de desfazer para o acervo inteiro, e cada imagem entra
  pelo pivô dela. O Recarregar não servia: ele compara caminhos inteiros, e a
  pasta nova tem os mesmos nomes em outro lugar.
- **Nome repetido avisa e não troca.** Palavra dele: *"avisa, não escolhe"*.
  Se `mao_aberta` está em duas subpastas da pasta nova, aquela imagem fica como
  está e a barra diz quais eram as candidatas. Escolher uma seria pôr a arte
  errada no personagem em silêncio.
- **O PSD alinha pela guia** (I8). Sobre o plugin do Spine ele disse: *"pivô
  automático com o PSD, isso é OURO"*. O nosso punha a origem no meio da tela
  e nunca lia o bloco de recursos do arquivo — agora lê o recurso 1032, e o
  cruzamento da primeira guia de pé com a primeira deitada é o `0, 0` do
  esqueleto. Sem guia, o meio da tela, como sempre foi: um PSD sem guias sai
  igual ao de antes, byte a byte.
- **Meia guia alinha meio, e diz qual metade.** Só uma guia: aquele eixo vem
  dela, o outro do meio da tela, e o aviso conta isso. Guia fora da tela também
  avisa — meio alinhado sem aviso é o pior dos dois mundos.
- **Painel Pivôs** (C4). *"Acertar e organizar o pivô de umas trinta peças
  rápido, igual programa de edição"* — Humberto, 17/09. A pasta inteira em
  grade, com a cruz em cada miniatura, e **sem janela que tranca**: não há
  botão de gravar porque **o clique já é o passo de desfazer**, e o `Ctrl+Z`
  desfaz. A janela **Definir pivô…** continua de pé para quem chega pelo botão
  direito numa imagem. O Spriter e o Spine põem o pivô na própria lista de
  imagens, nunca numa tela à parte.
- **Tamanho diferente avisa** (I8). O padrão da arte é **sem recorte**: a mesma
  tela, o encaixe no mesmo pixel. Quando as imagens de uma pasta têm telas de
  tamanhos diferentes esse alinhamento não existe, e o pivô passa a viajar por
  proporção — um palpite razoável, e não a verdade. O painel diz isso à vista,
  e não numa dica escondida.
- **Carimbar pivôs lê o corpo do instante** (8.7, fecha a suposição 12 do
  degrau 4b). Com o lobisomem na tela, carimbar o arquivo em foco gravaria os
  números do homem no atlas do lobisomem: a arte cairia torta e ninguém saberia
  por quê.

### v15.2 — Degrau 10, lote 2: as duas opções de recorte, o Spriter vira projeto, o glTF recebe um corpo — 18/09/2026

Chat D10 (`EXECUTANDO · arquivo`), tarefas 10.4, 10.5 e 10.6 do `ARQUITETO 4`.
Nada do runtime foi tocado.

- **Exportar imagem com as duas opções de recorte** (F16, Q21, spec §4.6): a
  borda automática — o padrão, o de sempre — ou **a área desenhada nesta
  animação**, o `crop` gravado nela. A janela diz, na hora, o tamanho e o canto
  da área; animação **sem** área não vira palpite: cai na borda automática e
  **avisa** (regra 21).
- **O retângulo magenta na cena**, tracejado, quando a animação aberta tem área
  gravada (Spriter cap. 26). Nada aparece onde não há dado.
- **O importador do Spriter faz um PROJETO**: cada `entity` vira um corpo, com
  o `manifest.json` da §2.9 ao lado e as listas do editor dentro. `npm run
  importar heroi.scml saida.bone` com várias entities grava a pasta inteira; com
  `--parte`, continua saindo um corpo só.
- **O pai do sprite por chave vira `slot`/`bone`** (spec 9.5 e 13.3): o desenho
  que troca de osso no meio da animação ganha uma chave stepped com o `x, y,
  angle, scale` daquela chave no `transform` — o runtime não converte nada, e é
  isso que faz a espada não saltar ao mudar de mão. `--assar` mantém o de antes
  (um osso só, o mais usado, com o aviso dizendo que ficou).
- **O glTF recebe um corpo, e a virada vira aviso** (10.6): com vários corpos no
  projeto, ele pergunta qual; a animação que troca de corpo sai com o corpo
  deste arquivo do começo ao fim, e a janela diz o segundo e o nome do corpo que
  ficou de fora.
- Treze testes novos: dez em `editor/testes/exportar-e-importar.test.ts`, três
  em `ferramentas/testes/importar.test.ts`.

### v15.1 — Degrau 9, lote 2: o lápis cria osso e regra, e a virada guarda a pilha — 18/09/2026

Chat D9 (`EXECUTANDO · peles`), tarefas 9.3 e 9.9 do `ARQUITETO 4`. Nada do
runtime foi tocado.

- **Um lápis só** (I5). *"O lápis não faz nada"* — o Humberto, testando ao vivo
  em 16/09, ao criar um osso com a pele `lobisomem` em edição e ver o osso
  nascer do corpo. O desenho já nascia na pele; o **osso** e a **regra** não.
  Agora nascem `skinRequired` e já listados na pele do lápis, **num passo de
  desfazer só** — um `Ctrl+Z` tira o osso e a marca juntos. Vale nos três
  caminhos: Novo ▾ → Osso, a ferramenta de criar osso na cena (pegando ou não
  os desenhos) e a janela guiada de Nova regra.
- **O sinal na Árvore e na cena**. O osso que só existe com uma pele leva uma
  marca na linha da Árvore, com **o nome da pele na dica**, e um anel tracejado
  na raiz, na cena. Sem sinal, o rabo do lobisomem sumia junto com a roupa e
  nada dizia por quê (regra 21). `skinRequired` sem pele nenhuma é dito como o
  que é: *"ele nunca aparece"*.
- **A pilha passa na virada?** (I14, spec §9.13). Com o cursor em cima de uma
  virada de corpo, Propriedades mostra a ficha dela, com a pergunta que o
  Humberto fez em 16/09: *"na virada de corpo, a pilha de peles passa ou não:
  quem faz decide"*. Ligado, o corpo novo entra vestindo as mesmas peles;
  desligado, entra com a pilha dele. Religar apaga o campo em vez de gravar o
  padrão.

### v15.0 — Degrau 8, lote 1: a grade lista entidades, a ordem chave a chave, a pasta numerada — 18/09/2026

Chat D8 (`EXECUTANDO · imagens, ordem e entidades`), tarefas 8.1, 8.2 e 8.6 do
`ARQUITETO 4`. Nada do runtime foi tocado.

- **A grade do botão direito lista entidades** (E6). Depois das imagens, nunca
  no meio delas: uma entidade é um `.bone` inteiro com relógio, e quem procura
  a outra mão não deve tropeçar na espada na fila. A miniatura é a mesma do
  painel Entidades, e continua **parada** (E16).
- **Trocar imagem por entidade herda osso, pivô, ordem e chaves** (E7). O anexo
  muda de tipo **dentro do mesmo slot e com o mesmo nome**: guardar o nome é o
  que faz toda chave `slot/attachment` continuar valendo, e guardar o slot é o
  que herda o osso e o lugar na ordem de desenho. Foi assim que os três
  programas olhados (Spriter, Spine, DragonBones) resolveram o mesmo problema.
- **A raiz do filho cai no pivô** da imagem que saiu, e não no centro dela
  (§7.11, §10.3). Sem pivô carimbado os dois pontos são o mesmo, e a conta
  devolve o `x, y` do anexo, que é a letra da §7.11. `pivotInBone` e
  `placeAtPivot` são a ida e a volta, e uma desfaz a outra.
- **A porta tem volta.** A grade abre também no desenho que já é entidade, e
  clicar numa imagem traz a imagem de volta, pelo pivô dela. Sem isso a troca
  era uma porta de mão única — e uma porta de mão única engana (regra 21).
- **Copiar a ordem grava chave a chave** (G3). Era uma chave só, em 0, e para
  chegar lá a cópia **apagava a linha de ordem inteira**. Na tela dava no
  mesmo, e por isso o defeito passava despercebido: os tempos das chaves —
  trabalho de alguém — iam para o lixo sem volta. Agora a ordem de agora é
  escrita em cada chave que existe, e na de 0; nenhum tempo se perde.
- **Pasta numerada vira sequência** (D4, `COMO SE FAZ EFEITO` #1).
  `olho_01…olho_08` não são oito desenhos: são **um** que pisca (§7.10). O
  cabeçalho da subpasta ganhou o botão direito com **Trazer como sequência**, e
  quem solta os oito na janela lê no rodapé onde está o gesto. O modelo é o
  Spine 4.2. Para valer como sequência, os números têm de ser seguidos e do
  mesmo tamanho: um buraco no meio quase sempre é arquivo que ficou para trás,
  e virar sequência ali esconderia o erro.

### v14.9 — Degrau 9, lote 1: Feitas e Ativas, a pilha separada do lápis — 18/09/2026

Chat D9 (`EXECUTANDO · peles`), tarefas 9.1, 9.2, 9.4, 9.5 e 9.10 do
`ARQUITETO 4`. Nada do runtime foi tocado.

- **O olho saiu; entraram duas colunas** (I7). *"No lugar do olho, eu queria
  poder clicar na skin e arrastar"* — Humberto, 17/09. **Feitas** lista as
  peles do corpo; **Ativas** é a pilha. Arrastar para Ativas liga, arrastar
  para fora desliga, arrastar dentro reordena. É o Character Map do Spriter.
- **A de cima vence** (I7c, spec §4.4). A coluna Ativas mostra a pilha de
  cabeça para baixo, porque quem vence tem de estar em cima, onde a mão o
  arrasta. Uma faixa "embaixo de todas" recebe quem vai para o fundo.
- **A `default` pode sair da pilha** (I10). Ela deixou de ser posta por baixo
  por fora: o editor passou a falar com o runtime pelo `setSkinStack` (a pilha
  pura da spec), e não mais pelo `setSkin` de compatibilidade. Tirar a
  `default` tira a arte dela da cena — é o lobisomem que troca quase tudo.
- **A pilha e o lápis, separados** (E10). `RECORTE_editor_state` passou a ter
  `pilha` e `emEdicao`; `visibleSkins` continua como vista dos dois, para os
  módulos que ainda a leem. Um arquivo de antes, só com `skins`, abre pela
  conta velha; um arquivo novo continua escrevendo `skins` para um editor de
  antes do degrau abrir igual.
- **Acender o lápis liga a pele** (I6): editar uma pele desligada seria pintar
  no escuro. Desligar uma pele **diz o que sumiu junto com ela** — "saíram 1
  osso e 2 desenhos que só existiam nela" (regra 21).
- **Defeito A4**: a regra **Comando** nascia com `targets: []`, não fazia nada
  e nada dizia. Agora o rodapé avisa na criação e a linha fica em vermelho na
  aba Regras, com a frase do que falta escolher.
- **Defeito A5**: **Inércia** mostrava `1`; o padrão da spec (§6.5) é `0,5`.
- **Defeito A6**: **Escala de referência** mostrava `1`; a spec (§3.5) diz
  `100`. Cem vezes errado, e só a física sentia.
- O painel **Exibição** deixou de dizer que a `default` "fica sempre embaixo":
  a frase virou mentira no dia em que ela passou a poder sair.

### v14.8 — Degrau 10, lote 1: Arquivo fala de projeto e de corpo — 18/09/2026

Chat D10 (`EXECUTANDO · arquivo`), tarefas 10.1, 10.2, 10.3 e 10.7 do
`ARQUITETO 4`. Nada do runtime foi tocado.

- **Novo, Abrir e Salvar falam de projeto e corpo** (P3): *Novo projeto*,
  *Abrir projeto…*, *Abrir pasta do projeto…*. O Salvar diz na dica o que
  grava: a pasta inteira — um `.bone` por corpo **e por entidade**, o
  `manifest.json` e o atlas.
- **Abrir outro corpo… / Abrir uma entidade…** (E17): um `.bone` de fora entra
  na lista Corpos, e a base dele abre; ou entra na lista Entidades, fechado.
  Nenhum dos dois toma o lugar do arquivo aberto — o `Ctrl+S` continua gravando
  o projeto de sempre. Nome repetido ganha um sufixo, e o rodapé diz que ganhou.
- **Entregar um corpo…** (P2): um corpo sozinho para o jogo, com o **atlas
  fatiado** — só as imagens que esse corpo usa, e não as do projeto todo.
- **Salvar a entidade editada…** (E4): *Novo* (cópia neste projeto) ou *Por
  cima* (o arquivo de origem), dizendo quantos corpos deste projeto a usam — e
  **admitindo que não sabe dos outros projetos**, em vez de mostrar um número
  inventado (regra 21).
- **Salvar como pacote… zipa o projeto inteiro** (§1.3, saída a): os outros
  corpos, as entidades e as listas da janela entram no `.bonez`, no mesmo
  manifesto (2.9). Um projeto de um corpo só sai como sempre saiu.
- **A uri da chave `body` passa pelo `skeletonsBase`** (10.7, fecha a suposição
  1 do degrau 4b): as chaves do projeto continuam sendo a **uri crua** — é por
  ela que o `Actor` acha o corpo, e o runtime não mudou —, e a tradução para o
  **caminho na pasta** acontece nas duas pontas do disco. Corpo em subpasta
  abre e salva; o atlas da raiz vai junto com ele.
- Nove testes novos em `editor/testes/arquivo.test.ts`.

### v14.7 — Fecho da rodada dos degraus 5, 6 e 7: três chats no editor ao mesmo tempo, 3.119 testes, 24 painéis — 18/09/2026

Pelo PLANEJADOR (`animador-5e`). Os três executores fecharam as suas versões
(D6 v14.0, v14.2, v14.4 · D7 v14.1, v14.6 · D5 v14.3, v14.5); esta é a do
fecho:

- **As seções deste arquivo voltaram à ordem** (v14.6 a v14.0, da mais nova
  para a mais velha): os três inseriam antes do que era o mais novo em cada
  momento, e ficou v14.1, v14.5, v14.3, v14.4, v14.2, v14.0. Só a ordem mudou;
  nenhum texto foi tocado.
- **O `versao.py` recusa número repetido em qualquer data.** Achado do D5:
  passada a meia-noite, a v14.4 nasceu duas vezes (`… 2026-09-17.zip` e
  `… 2026-09-18.zip`), porque o repetido só era barrado pelo nome do arquivo,
  que leva a data. O D5 regravou a dele como v14.5; o script agora confere o
  número.
- **Um painel novo precisa da linha no `layout-model.ts`**, senão a prova de
  medição não o mede (a arrumação de fábrica mora em `RIGHT_GROUPS`, não em
  `panel-groups.ts`). Achado do D5 pela própria medição, que contou 11 abas
  onde deviam ser 12; agora são **24 painéis medidos**, e a regra entra nos
  encargos das próximas rodadas.
- As cercas entre três chats na mesma pasta seguraram: quatro vermelhos de
  parte alheia foram avisados e nenhum consertado por quem não era o dono; a
  fila das portas fixas (roteiro e medição, um de cada vez) passou pelo
  Planejador as três vezes.

**Provas do fecho** (18/09, madrugada, com os três parados): `npx vitest run`
**3.119** (3.089 verdes, 29 pulados, 1 vermelho pré-existente do manual, 15/09)
· `tsc` do editor limpo · `npm run conformidade` 71 de 71 · roteiro **14 de 14**
· medição **24 de 24** de lado e **17 de 24** de altura · `programa/` montado
pelo D7 na v14.6.

**Fica anotado:** o arrasto da faixa da entidade pela origem, `nested/time` e
`baseAnimation` na faixa (D6, fora do degrau de propósito); criar e apagar
âncora de caminho pela cena (D7, o programa recusa dizendo por quê); o pivô e
o atlas do corpo do instante (D8); o uri da chave `body` por `skeletonsBase`
(D10).

### v14.6 — Degrau 7, lote 2: o desenho troca de osso por chave, pendurar cria tomada, e Chavear pesos — 17–18/09/2026

Pelo executor `EXECUTANDO · cena, árvore e malha` (Chat D7), por ordem direta
do Humberto. `ARQUITETO 4` D7 (7.2, 7.3, 7.6 e 7.7), spec §9.5, §9.6, §7.11,
`ARQUITETO 3` §6 e §7. Só `editor/`.

**O desenho troca de osso por chave** (F8, §9.5, tarefa 7.3). Até aqui, trocar
o osso de um desenho com uma animação aberta escrevia na **base**: o desenho
mudava de osso em toda animação do corpo, e o gesto custava **dois** passos de
desfazer. Agora é uma chave `slot/bone` no instante de agora, como o Spriter
grava no `object_ref` de cada chave. Para o desenho **não saltar**, a chave
carrega a posição dele medida do osso novo — `T·R·S = M_novo⁻¹ × M_antigo`, a
mesma conta do lote 34, e a mesma escolha de §9.4: quem carrega o número é a
chave, nunca o runtime. Antes da troca nasce um `null` em 0, para o desenho não
começar a animação já no osso novo; voltar ao osso do arquivo grava `null` e
nenhum `transform`. Osso e desenho vão no **mesmo comando**: um passo de
desfazer, que era o desvio 4 do Chat C no degrau 4a. O `transform` de §9.5 não
tem inclinação: quando ela sobra, o desenho entorta um pouco, e o rodapé diz.

**Pendurar cria tomada** (E9, §7.11, tarefa 7.2). Soltar uma entidade num osso
faz o mesmo que soltar uma imagem: nasce um slot naquele osso, e dentro dele um
anexo `skeleton` em vez de uma `region`. A tomada é o slot; o pino é o `x, y` do
anexo, onde ela foi solta — a raiz do filho cai no ponto em que a imagem
encaixava (E7). Com animação aberta, a entidade entra **nesta** animação a
partir de agora: chave `attachment` em `t`, e `null` em 0.

**Chavear pesos** (F9, §9.6, tarefa 7.6). Pintar peso continua indo para a
base, com animação aberta ou não: *peso é gesto de estrutura na cabeça de quem
pinta*, e gravar chave sozinho encheria a animação de chaves que ninguém pediu.
Quem quer o peso animado aperta o botão novo da aba Malha e pesos — ícone, com
o nome e o que ele faz na dica —, e só então nasce a chave, com **todos** os
pesos do `binding`, na ordem dele, soma 1 por vértice.

**A forma e os pesos vão para a base do corpo do instante** (M7, tarefa 7.7).
Gerar automática, Traçar contorno e Virar malha gravavam no arquivo **em
foco**: com a virada de corpo aberta, o ponteiro era medido num arquivo e
aplicado noutro, e o desenho errado mudava de forma, calado. Agora os três vão
para a base do corpo do instante, e o rodapé diz para qual.

**A chave `deform` velha passa a ser dita** (desvio 5 do Chat C). Mudar a forma
de uma malha que já tem chaves de deformação não quebra o arquivo — §9.6 manda
expandir e completar com zeros —, mas aqueles números foram medidos nos
vértices de antes e passam a cair em outros: a malha continua se mexendo, na
parte errada do desenho. Impedir tiraria a liberdade que o Humberto pediu;
converter seria o editor adivinhar. Então o programa **conta**: quantas chaves,
de quais animações, e o que acontece com elas. Visto ao vivo no herói, com a
`walk` aberta em 0,50 s: *"Malha nova: 35 vértices, 56 triângulos (foi para a
base). Atenção: 3 chaves de deformação de idle foram gravadas na forma de antes
e agora caem em outros vértices."*

### v14.5 — Degrau 5, lote 2: o painel Entidades, ao lado do Imagens — 17–18/09/2026

Pelo executor `EXECUTANDO · janela Animação` (Chat D5), por ordem direta do
Humberto. `ARQUITETO 4` D5 (5.4), `ARQUITETO 3` §4.2 (E15, E16). Só `editor/`.

**A aba vizinha da Imagens** (E15). A Imagens tem os desenhos; a Entidades tem
os corpos inteiros que entram como peça — a espada na mão, o capacete na
cabeça, o piloto na cabine. As duas são grades de miniatura pelo mesmo motivo:
a peça se reconhece pela forma, não pelo nome, e as duas são de onde se
**arrasta**. A aba entra no menu Janela logo depois da Imagens, no bloco de
montar.

**A miniatura é parada** (E16, veto do Humberto em 15/09, que substituiu a
"miniatura animada" proposta no manual). Ela é a pose de repouso da entidade,
desenhada uma vez. Uma fila de bonecos andando ao lado da cena rouba o olho de
quem está animando.

**A entidade sem esqueleto carregado aparece sem desenho**, com uma
interrogação e a dica dizendo por quê — em vez de um quadrado cinza vazio, que
pareceria uma peça toda transparente (regra 21).

**O arrasto sai daqui com o uri dentro**, num tipo próprio
(`text/x-recorte-entidade`), diferente do das imagens: quem recebe precisa
saber no `dragover` se o que vem é uma imagem ou um corpo inteiro, e descobrir
isso só no `drop` deixaria o cursor mentindo o caminho todo. **O soltar é do
degrau 7** (tarefa 7.2).

**Promover a corpo, no botão direito da linha** — a outra metade da tarefa 5.3.
Três caminhos, nesta ordem: o arquivo guardado de um corpo rebaixado nesta
sessão (instantâneo, nada se perde); o `.bone` lido da raiz da pasta do
projeto; e, sem nenhum dos dois, a recusa escrita.

**13 testes novos** em `editor/testes/pasta-do-projeto.test.ts` e
`editor/testes/previa.test.ts` — estes últimos provando que a Prévia segue o
corpo em foco: trocado o corpo, ela deixa de achar a animação do corpo que saiu
de cena, em vez de tocá-la.

### v14.4 — Degrau 6, lote 3: a faixa da entidade e a chave de sequência — 17/09/2026

Pelo executor `EXECUTANDO · linha do tempo` (Chat D6). `ARQUITETO 4` D6 (6.4 e
6.6), spec 7.10, 7.11, 9.6 e 9.9, Apêndice C 1; `ARQUITETO 3` §4.2 (E12b, E13,
E14); `programa-novo/05` G12. Dois módulos puros novos em `anim/`; o runtime
não foi tocado.

- **A faixa da entidade** (`anim/entity-band.ts`, E13 e E14). Uma entidade é
  uma imagem com relógio: o slot mostra um esqueleto inteiro. Na folha ela
  deixa de ser uma fileira de losangos e vira uma **faixa** — começa onde ela
  foi solta, acaba onde sai de cena, e traz escrito o nome da animação que o
  filho toca. Lê-se *"a mochila começa a acender aos 0,5 s e apaga aos 1,2"*
  sem abrir mais nada. **Nenhum campo novo**: tudo sai da chave
  `slot/attachment`, de `nested/animation` e de `nested/timeScale`.
- **A corrida é a unidade, não a chave** (Apêndice C 1): duas chaves seguidas
  mostrando o mesmo anexo são um trecho só, e o relógio do filho começa na
  primeira delas.
- **A precedência de 7.11 até a fonte 3.** Uma chave `nested/animation` ganha,
  inclusive com valor vazio (9.9: *"nada por cima"*, e não "cai para o
  anexo"). Com `inheritAnimation` a faixa escreve **"pelo pai"** e *não*
  inventa um nome: qual animação o filho toca depende de qual o pai está
  tocando, e isso não é dado desta animação (regra 21).
- **A linha aparece mesmo com a faixa vazia**, dizendo *"não entra nesta
  animação"*. Linha nenhuma deixaria a pessoa procurando onde a entidade foi
  parar.
- **Botão direito na faixa: a animação do filho** (E12b). A lista sai do
  arquivo do filho, que o `io/` leu ao abrir a pasta, e grava a chave
  `nested/animation`. Quando o editor não abriu esse arquivo, o menu **diz
  isso numa linha** em vez de aparecer vazio — um menu mudo faria pensar que a
  entidade não tem animação nenhuma. `EditorDoc` ganhou `skeletons`, só de
  leitura, para a faixa chegar a esse dado.
- **A chave de sequência de imagens** (`anim/sequence-key.ts`, G12), *"como
  opção"*, palavra do Humberto. Botão direito no nome da linha **Desenho** →
  **Sequência…**: os sete modos de 9.6 com nome em português, a imagem inicial
  e os segundos por imagem. A sequência já existia no formato (7.10), no
  runtime e como alvo em `keying.ts`; faltava **porta** — quem quisesse fazer
  a boca falar tinha de escrever a timeline à mão no `.bone`.
- **Não grava no escuro** (regra 21): um desenho sem `sequence` teria a chave
  recusada ao ler (L1 de 9.6), então a janela nem abre e o rodapé diz por quê,
  com o nome do desenho. Depois de gravar, o rodapé diz o que a chave vai
  fazer — uma chave de sequência é invisível na cena até o tocador andar.
- **Uma chave, e não uma por imagem.** A sequência é função do tempo (7.10):
  a chave diz *"daqui em diante, repetir, a partir da imagem 3, uma a cada
  0,08 s"* e o runtime calcula o resto. Uma chave por troca daria a mesma boca
  com trinta chaves para arrastar — o trabalho que a sequência existe para
  tirar.

`eixos-e-chaves.test.ts`: 66 → **89**.

### v14.3 — Degrau 5, lote 1: a janela Animação — Corpos em cima, Animações do corpo embaixo — 17/09/2026

Pelo executor `EXECUTANDO · janela Animação` (Chat D5), por ordem direta do
Humberto. `ARQUITETO 4` D5 (5.1, 5.2 e 5.3), `ARQUITETO 3` §1.2, §1.4 e §2.2
(M1, M8, M9), `programa-novo/02` (M8, E2, E3). Só `editor/`.

**Corpos em cima, Animações do corpo embaixo** (M8, tarefa 5.1). O documento
virou projeto no degrau 4b — o homem e o lobisomem, cada um com a base dele e
as animações dele —, e até agora não havia porta para andar entre os dois: as
listas moravam no manifesto e ninguém as via. A janela Animação passa a ter
duas listas. Em cima, **Corpos**: uma linha por corpo, com o nome e quantas
animações ele tem, e o nome do corpo em foco em negrito. Embaixo,
**Animações de fulano**: a lista de sempre, agora com o nome do dono no título.

**Clicar num corpo abre a base dele.** Dois efeitos num gesto: o corpo em foco
troca — a cena, a Árvore, a Ordem e as Propriedades passam a ser as dele — e a
**base** abre (`doc.animation === null`, o quadro 0 de §5.1). O corpo que sai
não é fechado: ele guarda a animação e o segundo em que estava, e continua
inteiro na lista.

**Como o foco troca sem a casca se remontar.** A cena e os painéis seguram UM
objeto `Doc` desde o arranque, e trocar o objeto seria remontar o programa.
Então o que troca é o **conteúdo**: os dois documentos trocam de arquivo, de
atlas, de ator, de agulha e de caminho, e o projeto troca as duas chaves do
mapa no mesmo instante. Quem ouve, quem guarda a pilha e o projeto ficam.

**A pilha passou a anotar o uri, e não o objeto.** É a consequência exata da
linha acima, e ela tinha de ser tratada: o passo dado no homem, desfeito depois
de trocar para o lobisomem, procuraria os ossos do homem dentro do lobisomem —
e um `revert` que não acha o que removeu não avisa nada, só não desfaz. O uri
não troca de dono, então é ele que a pilha anota; o projeto responde quem
segura cada uri agora. Uma pilha só, como no 4b.

**Salvar como base nova** (M9, tarefa 5.2). Com a animação em `t`, o botão cria
um corpo novo: a cópia do corpo do instante com a pose daquele segundo gravada
como **base**. Entram os ossos posados, o desenho que está à vista em cada
slot, a cor do slot, e o `deform` da malha somado em `vertices` (ou em
`binding.positions`, para malha com pesos — as duas listas casam índice a
índice com o `deform`, §7.4). Valor igual ao de fábrica **sai** do arquivo em
vez de entrar escrito: um `.bone` não fica mais verdadeiro por repetir
`"scaleX": 1` em cada osso. **A animação de origem não muda uma vírgula.** As
animações vêm na cópia, porque o pedido é *"cópia do corpo"*, e o rodapé diz
quantas vieram. Não é passo de desfazer, e o rodapé não finge que é: um corpo
novo é um arquivo a mais no projeto, como Abrir.

**Promover e rebaixar** (E2, E3, tarefa 5.3). Rebaixar tira o corpo da lista
Corpos e o põe em Entidades, **inteiro**: o documento dele fica guardado, e
promover devolve sem perder uma vírgula. O corpo em foco não se rebaixa, nem o
único corpo do projeto, e a barra diz por quê em vez de não fazer nada. Uma
entidade que veio montada dentro de outro `.bone` **não** é promovida: ela é um
esqueleto pronto, não um arquivo que se possa abrir — e pôr em Corpos um corpo
que não abre seria prometer uma porta que não existe (regra 21).

**Os dois botões novos nascem em ícone**, com o nome e o porquê na dica, e
moram na tira da lista Corpos: quem lê a janela de cima para baixo encontra o
botão ao lado da lista em que ele age.

**21 testes novos** em `editor/testes/animando.test.ts`, e um reescrito: a
altura mínima da lista deixou de ser um número num bloco e passou a ser a
**soma** das duas listas, que é a regra que aquele número protegia.

### v14.2 — Degrau 6, lote 2: a linha da virada, o osso do desenho e os pesos na folha — 17/09/2026

Pelo executor `EXECUTANDO · linha do tempo` (Chat D6). `ARQUITETO 4` D6 (6.3 e
6.5), spec 9.5, 9.6 e 9.13. Só `anim/keying.ts` e `panels/dopesheet*`; o
runtime não foi tocado.

- **Três linhas que a folha desenhava sem saber nomear.** A timeline `body`
  existe no arquivo desde o degrau 4b, e `labelOf` não a conhecia: ela aparecia
  com o nome **vazio**, no grupo "Geral", entre os eventos e a ordem de
  desenho. `weights` (9.6) saía igual; `slot/bone` (9.5) saía com o rótulo
  `bone` cru. É a regra 21 em estado puro — desenhar o que não se sabe nomear
  —, e as três passam a ter nome: **Virada de corpo**, **Pesos** e **Osso do
  desenho**.
- **A virada tem grupo próprio** e **nunca é filtrada** por "mostrar só os
  escolhidos". Ela não é de osso nem de slot, e dali em diante o personagem é
  outro: escondê-la porque o braço está escolhido seria a folha calar a coisa
  mais estrutural que ela tem.
- **A célula em degrau** (`steppedCells`, `.dope-degrau`): as linhas que
  carregam um NOME ganham uma faixa com o nome escrito, da chave até a chave
  seguinte — o corpo que a virada colou (`lobisomem`), o osso para o qual o
  desenho foi (`costas`), a animação que a entidade passou a tocar. Um losango
  diz *quando* algo mudou e cala *para o quê*. A célula fica por baixo dos
  losangos e não recebe ponteiro: o losango continua sendo o que se clica, se
  arrasta e se apaga. A dica traz o uri inteiro, que não cabe escrito.
- **`weights` ganhou o endereço de três partes** `(slot, skin, placeholder)`,
  como a spec 9.6 manda com estas palavras, e **interpola o array inteiro**
  com uma curva só, como o `deform`. Sem isso ele cairia no ramo de
  `components` e a malha animaria **um** vértice, ficando parada no resto.
- **Antes da primeira chave `body` vale o arquivo**, e não a primeira chave: a
  única exceção à regra de 9.10, porque toda animação nasce no corpo em que foi
  gravada.

`chaves.test.ts`: 78 → **94**. O teste `menus > escondidas > g` foi reescrito:
a dica do losango virou dado (`KEY_HINT`) e ganhou os gestos do lote 1.

### v14.1 — Degrau 7, lote 1: B cria osso, a Malha pega caixa, máscara e caminho, e o botão direito ganha porta no menu — 17/09/2026

Pelo executor `EXECUTANDO · cena, árvore e malha` (Chat D7), por ordem direta
do Humberto. `ARQUITETO 4` D7 (7.1, 7.4 e 7.5), `programa-novo/05` G1,
`programa-novo/09` A3 e A7. Só `editor/`.

**As três teclas** (G1, tarefa 7.1). `B` de *bone* cria osso, como no Spriter;
o Posar desce para `Y`, que fecha a fila `Q W E R T Y` das ferramentas de
mexer; o `N` fica **livre**. O `Alt` de redesenhar osso e o `Alt` de inclinar
continuam onde estavam. A troca está em dois lugares — a tecla que cada
ferramenta declara e a tabela `TOOL_KEYS` —, e o teste de conflito compara os
dois.

**A Malha pega caixa, máscara e caminho** (defeito A3, tarefa 7.4). A ficha da
caixa e a da máscara sempre disseram *"arraste com a ferramenta Malha"*, e a
Malha só pegava `mesh`: a frase mandava para uma porta fechada. Os quatro tipos
guardam o contorno do mesmo jeito (§7.4), então a mesma conta serve aos quatro
— mas só o `mesh` tem `uvs`, `triangles` e `hull`, e só o caminho tem
`lengths`: cada um grava o que o tipo tem, e nada mais. O canto novo de uma
caixa ou de uma máscara entra **na aresta mais perto**, para o contorno
continuar fechado e em ordem; o contorno nunca desce de três cantos. O caminho
se arrasta e refaz o `lengths` sozinho; ganhar ou perder âncora ainda não tem
porta, e ele **diz isso** em vez de não fazer nada. Caixa em retângulo ou
elipse não tem canto: a Malha manda para a ficha, com a frase.

**O botão direito ganha porta no menu** (defeito A7, tarefa 7.5). Ele fazia
duas coisas conforme o pixel — em cima de um desenho abria a grade de opções,
fora dele voltava à ferramenta de antes — e nenhuma das duas tinha item de
menu. Agora **Exibir → Ferramenta de antes** e **Esqueleto → Opções do
desenho…** chamam exatamente o mesmo caminho do gesto. Sem desenho escolhido, o
item diz o que falta.

### v14.0 — Degrau 6, lote 1: as três teclas da linha do tempo, e o arrasto conferido no Spriter — 17/09/2026

Pelo executor `EXECUTANDO · linha do tempo` (Chat D6), por ordem direta do
Humberto. `ARQUITETO 4` D6 (6.1 e 6.2), `programa-novo/05` G2 e G11. Só
`panels/dopesheet*`; o runtime não foi tocado.

- **`Ctrl` soma, `Shift` tira, sem tecla troca** (G2). Era o contrário: `Shift`
  somava e `Ctrl` tirava. A troca vale nos dois gestos de escolher — o clique
  no losango e o retângulo de laço em faixa vazia —, porque duas tabelas de
  tecla se separam com o tempo. `Ctrl` ganha do `Shift` com as duas apertadas:
  é dele o gesto que continua no arrasto.
- **`Shift` + clique não começa arrasto.** Tirar não é pegar: um arrasto que
  começasse tirando moveria justamente a chave que a mão acabou de soltar.
- **`Ctrl` + arrastar continua clonando** (item 6, v13.2), agora somando a
  clicada à seleção antes de clonar, em vez de tirá-la.
- **Arrastar move as escolhidas, e nunca empurra as seguintes** (G11) —
  **conferido no Spriter antes**, como o Humberto mandou. Manual do Spriter,
  cap. 11 *Editing Timing*: *"arrastar quadro-chave; Ctrl para pegar vários"*,
  e não há modo `ripple` em lugar nenhum dele. O Recorte também nunca empurrou
  pelo arrasto: "empurrar" é o comando **Animação → Empurrar as chaves…**
  (v13.1). O achado está escrito nos Desvios do Chat D6, e três testes novos
  fecham a porta, um deles pondo os dois comportamentos lado a lado.
- **A dica do losango diz o que o arrasto leva** (regra 21): *"Arrastar move as
  escolhidas · Ctrl soma, Shift tira · Ctrl + arrastar clona · Botão direito:
  curva · Duplo clique: apagar"*. Com várias chaves escolhidas o arrasto leva
  todas, e antes disto nada na tela explicava por quê.
- **A decisão é pura** (regra 8): `selectionModeOf`, `startsKeyDrag` e
  `clonesOnDrag` moram em `panels/dopesheet-model.ts`, sem DOM. O ponteiro só
  obedece. Sem jsdom não se testa um `pointerdown`; testa-se a regra inteira.

`linha-do-tempo.test.ts`: 79 → **88**. `tsc` limpo nos arquivos da parte.

### v13.9 — Degrau 4b: o documento vira projeto; a virada de corpo na tela — 17/09/2026

Pelo executor `EXECUTANDO · degrau 4b` (`animador-8a`), por ordem direta do
Humberto. `ARQUITETO 4` D4b, spec 2.9 e 9.13, `ARQUITETO 3` §1 e §14. Só
`editor/src`, `editor/testes` e os arquivos de passagem; o runtime não foi
tocado. Plano e desvios: `documentos/planos/DEGRAU 4b - o projeto de varios corpos 2026-09-17.md`.

- **O projeto** (`doc/projeto.ts`): `Projeto { corpos: Map<uri, Doc>, entidades,
  emFoco, manifesto }`. Cada corpo continua sendo um `.bone` num `Doc`; o
  `Command` continua por `Doc`; **uma pilha de desfazer só** — `doc/undo.ts`
  anota em que documento cada passo foi dado e reverte nele. A cena e os
  painéis ouvem o corpo em foco; um passo dado noutro corpo volta ao foco
  pelo projeto, com o ator refeito e o rodapé dizendo *"(na base de
  lobisomem)"*.
- **As listas Corpos e Entidades e o corpo em foco** moram em
  `manifest.extras.RECORTE_projeto` (spec 2.9): `main` é o corpo em foco,
  `skeletons` são todos. Um leitor ignora `extras`. Nenhum campo novo no
  núcleo do formato.
- **O corpo do instante** (spec 9.13, M12): o documento posa pelo `Actor` do
  runtime (`Pose(projeto, animação, t)` de 9.10). `doc.skeleton` é o esqueleto
  vivo do corpo que vale em `t`; `doc.body` diz qual (`null` = o arquivo);
  `doc.corpo()` é o documento dele. A Árvore, a Ordem e as Propriedades leem
  `corpoDe(doc).file`: em 0,25 a Árvore do homem, com o braço; em 0,75 a do
  lobisomem, com o rabo. A pilha de peles da tela passa pelo ator a cada
  pose. Um corpo que a chave cita e o projeto não tem: fica o de antes, com
  `BODY_MISSING` na barra de avisos (regra 21).
- **Abrir pasta com `manifest.json`** (`io/project-open.ts`, saída **a** de
  §1.3): um `.bone` por corpo e por entidade na raiz, um atlas. O manifesto
  manda; sem ele, a pasta abre como antes. **Salvar** grava os outros corpos
  e o `manifest.json` ao lado do `.bone` em foco, pela pasta do projeto —
  só quando o projeto tem mais de um arquivo: o herói sozinho salva como hoje.
- **Colar corpo aqui** (menu Animação, M10): grava a chave `body` no tempo de
  agora (`anim/body.ts`); dali em diante a cena, a Árvore, a Ordem e as
  Propriedades mostram o corpo colado. Com vários corpos pergunta qual, e
  oferece a volta ao corpo do arquivo (a chave `null`). Desfazer tira a chave.
- **Mexida estrutural vai para a base do corpo do instante** (M7): osso novo,
  ponto, caixa, malha, trocar de pai, soltar e trocar imagem, os comandos da
  Árvore, da Ordem e das Propriedades escrevem no `Doc` do corpo de `t`. O
  rodapé diz *"(foi para a base de lobisomem)"* (`wentToBase` no contrato).
  As chaves continuam indo para a animação do arquivo em foco.
- **Testes:** 34 novos em `documento`, `arvore`, `ordem`, `paineis` e
  `arquivo`; três testes de texto-fonte acompanharam a mudança. Editor 2.017,
  suíte 2.995, `tsc` limpo, roteiro 14 de 14, medição 22 de 22 e 15 de 22.

### v13.8 — Fecho da rodada dos degraus 2, 3 e 4a: 71 casos, dois runtimes, confronto sem diferença — 17/09/2026

Pelo PLANEJADOR (`animador-5e`). Os três executores fecharam as suas versões
(B v13.4, C v13.5, A v13.6 e v13.7); esta é a versão do fecho, e do que só o
Planejador podia fazer:

- **Os 18 casos do rascunho 0.2 entraram em `casos/`** (C-270, C-273 a C-277,
  C-279, C-290 a C-300). Regra da §12.8: só quando os **dois** runtimes
  passam. `node ferramentas/conformidade.mjs` **71 de 71**;
  `python runtime-python/conformidade.py` **71 de 71**;
  `node ferramentas/comparar-runtimes.mjs` **71 de 71 concordam campo a
  campo**. `casos-pendentes/` fica vazia, com um leiame dizendo por quê.
- **Três casos novos durante a rodada**, com duas contas cada:
  `C-298-pilha-sem-default` (a `default` fora da pilha; nenhum caso pegava),
  `C-299-fundo-comeca-na-chave` e `C-300-evento-do-filho-no-relogio-do-pai`
  (o relógio do filho: os dois runtimes tinham lido a spec de jeitos
  diferentes; o Python já batia, o TypeScript foi corrigido na v13.7).
- **Apêndice C da spec**: as 16 leituras do runtime Python, escrito só pelo
  texto, viraram texto normativo; dois códigos novos (`TARGET_MISSING`,
  `NESTED_GONE`); §2.8 ganha o `binding` traduzido por nome e o slot repetido.
- `conformidade/adaptador-referencia.mjs` passa `files` e `bodies` ao runtime,
  como o executor; `ferramentas/comparar-runtimes.mjs` ganha `--casos`;
  `ferramentas/testes/conformidade.test.ts` carrega os casos com o mesmo
  resolver (e o adaptador de propósito errado também, para o erro dele
  continuar sendo só o sinal do shear).
- Documentos: `conformidade/README`, `REGISTRY` (71 de 71 nos dois, linhas do
  0.1 datadas), `dois-runtimes`, spec §12.4 e Apêndice B 14 (fechada),
  `ENCARGOS`, `QUEM E QUEM`, `ESTADO`.

**Provas do fecho:** `npx vitest run` **2.961** (2.931 verdes, 29 pulados, 1
vermelho pré-existente do manual, 15/09) · `tsc` do editor limpo · roteiro
14 de 14 · medição 22 de 22 de lado e 15 de 22 de altura · `programa/`
montado de novo (o runtime mudou depois do fecho do Chat C).

**Fica anotado para o D7** (desvios do Chat C): o desenho que troca de osso na
base com seleção mista é dois passos de desfazer, e tem de virar um; a Malha
com animação aberta cria vértices na base e uma chave `deform` antiga fica com
o tamanho velho.

### v13.7 — Runtime TypeScript segue o Apêndice C: o relógio do filho sem estado — 17/09/2026

Lote 2 do Chat A. O runtime de referência passa a ler a spec como o runtime
Python leu onde ela era muda (Apêndice C da spec 0.2). Só `runtime/`, o pose
dump e testes mudaram.

- **Relógio do filho sem estado (regras 1 e 2).** Começa na corrida de chaves
  `slot/attachment` que mostra a entidade em `t`. Troca de pele não zera. O
  tempo do pai é o enrolado: em laço, o filho recomeça a cada volta.
- **Laço da animação de cima (regras 3 a 5).** `nested/animation` usa o `loop`
  do anexo; `inheritAnimation`, o laço do pai; `nested/time` manda em qualquer
  fonte.
- **Evento do filho no relógio do pai (regras 6 e 7).** No dump, o `time` sai
  no relógio do pai. Os eventos do fundo chegam também, com o slot na frente.
- **Pele de fora com malha pesada (regra 8).** `binding.bones` é traduzido pelo
  nome do osso.
- **Física da virada (regra 12).** Só o corpo que volta é zerado.
- **A instância que some (regra 16).** Some sempre que o slot deixa de
  mostrá-la, com `NESTED_GONE` uma vez. O aviso da virada também passa a se
  chamar `NESTED_GONE`.
- **Alvo que falta fora da virada (regra 14).** Mensagem com `TARGET_MISSING`;
  continua L1 em modo estrito.
- **`transform` em todo anexo sem pesos (regra 13).** A regra de caminho lê o
  osso aplicado.

| Prova | Resultado |
|:---|:---|
| `node ferramentas/conformidade.mjs` | 53 de 53 |
| `--casos conformidade/casos-pendentes` | 18 de 18 (entraram o C-299 e o C-300) |
| `runtime/testes` e `ferramentas/testes` | 960, antes 951 |
| `tsc` do editor | limpo |

### v13.6 — Runtime TypeScript no rascunho 0.2: a pilha, a virada de corpo e o de fora — 17/09/2026

Degrau 2 do `ARQUITETO 4`, Chat A. Só `runtime/`, o pose dump, o executor da
conformidade e os dois testes do formato do dump mudaram. O Python e o editor
não foram tocados.

- **A pilha de peles (§4.4).** A `default` é uma pele como as outras.
  `setSkinStack(lista)` é a pilha exata, de baixo para cima, e a de cima
  vence. Um esqueleto novo nasce com `["default"]`. `setSkin` continua
  pondo a `default` por baixo, porque o editor conta com isso.
- **A virada de corpo (§9.13).** Classe nova `Actor`: um `Skeleton` por
  corpo, montado uma vez, nunca remontado. Antes da primeira chave `body`
  vale o arquivo. As timelines casam por nome com o corpo do instante; o nome
  que falta avisa `BODY_UNMET`, uma vez. `keepSkins` leva a pilha ou volta
  a `["default"]`. A entidade continua no slot de mesmo nome e mesma `uri`.
  O corpo que entra começa a física do zero. `AnimationState.apply` e
  `CanvasRenderer.draw` aceitam o `Actor`.
- **O desenho troca de osso (§9.5).** A chave `slot/bone` com `transform`,
  `T` antes de `R`. `Slot.bone` é o osso aplicado; a setup pose devolve o do
  arquivo.
- **Pesos animados (§9.6).** A timeline `weights`, pelo caminho do `deform`,
  sem renormalizar.
- **O que vem de fora (§2.8).** `loadSkeletonFile(bytes, { files })` lê os
  arquivos ao lado. A pele de fora traz osso, slot e regra `skinRequired`, no
  fim. O `rig` é conferido (`RIG_UNMET`). `rig.reference` multiplica `x` e
  `y`. O corpo de cada chave `body` volta carregado em `bodies`.
- **O filho em duas camadas (§7.11).** `baseAnimation` por baixo, com relógio
  próprio; `inheritAnimation` responde ao pai pelo nome.
- **O pose dump (§12.4).** `body` em toda amostra, `slots.bone`, e os canais
  do filho com o slot na frente (`weapon/lamina/lamina`, `weapon/disparo`).
- **Avisos novos.** `CLIP_SELF_INTERSECT` na máscara que se cruza,
  `SLOT_BONE_UNMET`, `RANGE_WEIGHTS_SIZE`, `BODY_AT_START`, `BODY_MISSING`,
  `ENTITY_GONE`. `animation.crop` é lido e guardado.
- O socket já tinha saído do runtime. Sobrou um comentário, que saiu.

| Prova | Resultado |
|:---|:---|
| `node ferramentas/conformidade.mjs` | 53 de 53 |
| `--casos conformidade/casos-pendentes` | 16 de 16 (os 15 do encargo e o C-298) |
| `runtime/testes` e `ferramentas/testes` | 951, antes 885. Nenhum vermelho |
| `tsc` do editor | limpo |

Os desvios estão em `documentos/planos/ENCARGOS degraus 2 3 4a 2026-09-17.md`,
seção "Chat A".

### v13.5 — O editor sem freio: editar sempre grava, nada some por modo — 17/09/2026

Degrau 4a do `ARQUITETO 4`, Chat C. Só `editor/src`, `editor/testes` e o
roteiro mudaram. O runtime não foi tocado. `doc.animation === null` continua
sendo a base aberta.

- **Editar sempre grava (M6).** Saíram o botão **Gravar sozinho**, a tecla `A`
  e a saída `'bloqueado'`. Com uma animação aberta, mexer grava chave,
  trocar a imagem grava chave e a ordem de desenho grava chave. Onde a
  animação aberta não está no arquivo, o rodapé diz.
- **Chavear protege a pose.** `K` e `Ctrl+K` ficam, com a dica "Protege a
  pose", como o Key selected e o Key all do Spriter.
- **O semáforo do Chavear saiu (G13).** Sem verde, sem vermelho: a marca de
  chave fica na folha.
- **Nenhuma ferramenta some por modo (M4).** `Tool.modes`, `toolsForMode`,
  `syncToolModes`, `toolForKey` e o recado "é da Montagem. Ctrl+Tab troca de
  modo" saíram. Toda letra de ferramenta vale sempre.
- **O tocador nunca apaga (M5).** Com a base aberta, o relógio diz `0,00 s`,
  a folha mostra um losango, e os botões de tocar ficam cinza com a dica "a
  base tem um quadro só".
- **Os recados de Montagem viraram "foi para a base".** Osso novo, redesenhar
  osso, pegar os desenhos, a forma e os pesos da malha, e o desenho que troca
  de osso junto com a chave de pai.
- O interruptor `Montagem | Animando` fica na barra até o D11. A dica diz
  **Base | Animação**, e o rodapé diz "Base" ou "Animação: nome".

| Prova | Resultado |
|:---|:---|
| Testes do editor | 1.983, iguais à linha de base. 29 pulados, 1 vermelho do manual (15/09) |
| `tsc` | limpo |
| Roteiro | 14 de 14 |
| Medição | 22 de 22 de lado, 15 de 22 de altura |
| Suíte inteira | 2.868. Além do manual, 3 vermelhos em `ferramentas/testes/conformidade.test.ts`, da obra do runtime (Chat A) |

Os desvios estão em `documentos/planos/ENCARGOS degraus 2 3 4a 2026-09-17.md`,
seção "Chat C".

### v13.4 — Runtime Python no rascunho 0.2: a entidade, o de fora e a virada de corpo — 17/09/2026

Degrau 3 do `ARQUITETO 4`, Chat B. Escrito **só pela spec 0.2** e pelos
`leiame.md` dos casos; o runtime TypeScript não foi aberto. Só
`runtime-python/` mudou.

- **Esqueleto aninhado, a entidade (§7.11).** O filho é carregado pela `uri`,
  uma vez, com guarda de ciclo e de profundidade. A raiz dele fica em
  `M_ossoDoSlot × T·R·S` do anexo. Duas camadas: `baseAnimation` por baixo, com
  relógio próprio; por cima, `nested/animation`, `inheritAnimation` ou
  `animation`, nessa ordem. Ossos, slots, vértices e pontos do filho entram no
  dump com o prefixo `<slot>/`; eventos chegam como `<slot>/<evento>`.
- **Animações e peles de fora (§2.8).** `assets.animations` e `assets.skins`
  entram pelo nome; o local vence. `rig` conferido com `RIG_UNMET`.
  `rig.reference` multiplica as translações. A pele de fora traz osso, slot e
  regra `skinRequired`, no fim dos arrays, com o corpo montado uma vez.
- **O mesmo do degrau 2.** Pilha de peles sem `default` implícita (o
  esqueleto nasce com `["default"]`). `Actor` com a virada por `body`: um
  esqueleto por corpo, montado ao carregar; antes da primeira chave vale o
  arquivo; `keepSkins`; a entidade continua no slot de mesmo nome.
  `slot/bone` com `transform` (T depois R). `weights` animados, sem
  renormalizar. O dump ganha `body` por amostra e `bone` em `slots`.

| Prova | Resultado |
|:---|:---|
| `python runtime-python/conformidade.py` | 53 de 53 |
| o mesmo, com `--casos conformidade/casos-pendentes` | 16 de 16 (os 15 do encargo e o C-298) |
| o executor oficial com `--adaptador` Python | 53 de 53 e 16 de 16 |
| testes próprios do Python | 145 (eram 129) |

Onde a spec não bastou: 16 suposições, escritas em
`documentos/planos/ENCARGOS degraus 2 3 4a 2026-09-17.md`, seção do Chat B.

### Rascunho 0.2 da especificação — o modelo novo do programa — 17/09/2026

**O rascunho 0.2 não abre arquivo do rascunho 0.1, e ninguém lê o 0.2 ainda
(M13).** Decisão do Humberto, 17/09/2026: enquanto o formato é rascunho, não
há compatibilidade entre rascunhos; o princípio 1 da §1.3 ("arquivo velho
sempre abre") passa a valer a partir da 1.0 publicada. Nenhum runtime, nenhum
schema e nenhum editor lê o 0.2 neste momento: é **texto**, o degrau 0 do
`documentos/planos/ARQUITETO 4`. O código continua congelado.

O que o degrau 0 entregou, sem tocar em `editor/`, `runtime/`, `bone.schema.json`
nem no validador:

- `formato/ESPECIFICACAO 2026-09-17.md`, reescrita seção por seção pela lista
  do `ARQUITETO 3` §13, com as respostas A1–A8 valendo como decididas. A
  0.1 (06/09) está em `backup/ESPECIFICACAO_2026-09-06_rascunho-0.1-antes-do-0.2.md`.
  **Sai**: o socket (`point.socket`, `skeleton.socket`, `childSocket`,
  `rig.sockets`). **Muda de sentido**: a `default` é uma pele como as outras;
  a pilha de peles, a de cima vence; a setup pose é a base do corpo; o
  `.bonez` é o projeto do editor. **Entra**: a timeline `body` (a virada,
  §9.13), `slot/bone` com `transform` (§9.5), `weights` (§9.6),
  `animation.crop` (§4.6), a pele de fora com osso (§2.8), `rig.reference`
  (§4.8), o princípio 11 (quadro é função pura do tempo, com a física como
  exceção escrita), o glossário português ↔ JSON (§1.6), o campo `body` e o
  campo `bone` de `slots` no pose dump (§12.4). Apêndice A: 62 revogada, 72 a
  80 novas. Apêndice B: cada aberta diz fecha, adia ou vira extensão.
- `conformidade/casos-pendentes/C-290` a `C-297`: oito casos novos, com o
  esperado calculado à mão por duas contas independentes no `leiame.md`.
- `formato/exemplos/`: `mecha`, `espada`, `capacete` e `mecha-pele-inverno`
  refeitos sem socket; `heroi.bone` perde o `socket` do `hand_point`; entram
  `formato/rigs/humanoide-v1.bone` (a convenção de nomes) e
  `formato/rigs/lobisomem-rabo.bone` (pele de fora com osso — o validador de
  hoje a recusa, porque não sabe que um `parent` pode vir do `rig`; passa no
  degrau 1).

**Degrau 1, no mesmo dia (17/09/2026, manhã).** Código de runtime e editor
continua congelado; o que mudou é o formato, os validadores e as provas:

- **Conserto pedido pelo Humberto:** `offset` era duas coisas. A posição do
  anexo na chave `slot/bone` passa a chamar-se **`transform`** (§9.2, §9.5);
  `offset` fica só o inteiro do `deform`. O schema não adivinha mais pelo tipo.
- `formato/bone.schema.json` é o do **0.2** (`$id` `bone-0.2`): entram
  `body`, `weights`, `slot/bone` com `transform`, `animation.crop` e
  `rig.reference`; saem `socket`, `childSocket` e `rig.sockets`; a `default`
  perde a regra especial (só na descrição: o schema nunca a teve em estrutura).
  `site/validador/esquema-compilado.js` recompilado.
- **Validadores.** O núcleo (`site/validador/nucleo.js`) ganha as referências
  por nome da §4.7 (osso do slot, slot da pele, alvo de timeline, chave de pai
  e de troca de osso, evento, ordem de desenho) com as **duas exceções**: um
  nome que vem do `rig` (é o que deixa a pele com osso pendurar no hospedeiro)
  e um nome que existe num **corpo citado por `body`** (o validador abre o
  corpo, do disco ou de dentro do `.bonez`; sem conseguir abrir, vira aviso
  `BODY_UNMET`, nunca erro nem silêncio). Códigos novos: `BODY_AT_START`,
  `BODY_MISSING`, `BODY_UNMET`, `EXTERNAL_BONE_NOT_SKIN`, `RANGE_WEIGHTS_SIZE`,
  `RANGE_WEIGHT_SUM` em chave, `REF_EVENT_MISSING`, `ORDER_TIMELINE_DUPLICATE`
  (inclusive duas `body`), e `HINT_UNKNOWN_PROPERTY` para `socket` de arquivo
  velho. O núcleo devolve **avisos** além de erros; só o erro derruba o
  arquivo. **A linha de comando passa a importar o núcleo** em vez de carregar
  uma cópia, e **abre `.bonez`**: manifesto, principal, todo esqueleto listado
  e todo atlas listado, cada um com o seu veredito; `--json` dá o relatório de
  máquina. A pele com osso `rigs/lobisomem-rabo.bone` passa a validar.
- **Casos.** `C-271`, `C-272` e `C-278` apagados (só existiam pelo socket;
  cópia em `backup/degrau-1_2026-09-17_antes/casos-pendentes/`). Os sete que
  sobrevivem refeitos sem socket: `hand_socket` virou `hand_point`, um ponto
  comum; o `punho` da arma perdeu o socket; o `rig` só de sockets saiu; toda
  amostra ganhou `body: null`. Os oito novos (C-290 a C-297) **ficam em
  `casos-pendentes/`**: é o lugar que a §12.4 define para caso completo que
  nenhum runtime passa ainda; em `casos/` fariam `npm run conformidade`
  reprovar o runtime congelado.
- **Documentos de conformidade:** `README`, `como-provar`, `how-to-prove`
  (a sonda `skins` é a pilha; o dump ganha `body` e `slots.bone`),
  `dois-runtimes` (nenhum dos dois lê o 0.2), `REGISTRY` (as linhas medem o 0.1).
- **Teste novo:** `ferramentas/testes/validador-rascunho-0-2.test.ts`.
  A suíte sobe de 2.839 para **2.868** testes.

**Provas do fecho do degrau 1** (17/09/2026, manhã): `npx vitest run` 2.838
verdes, 29 pulados (o manual pausado), **1 vermelho pré-existente de 15/09**
(o teste do manual espera nomes de capítulo que mudaram; código congelado, não
consertado) · `npx tsc --noEmit -p editor/tsconfig.json` limpo · `npm run
conformidade` 53 de 53 · `npm run roteiro` 14 de 14 · `npm run medir` 22 de 22
de lado e 15 de 22 de altura · `npm run validar -- --todos` 9 de 9 · `rigs/` 2
de 2 · `ZIP-501/entrada.bonez` abre com três vereditos · a página do validador,
aberta no navegador, mostra os seis erros do arquivo de exemplo com o núcleo
novo.

O que fica para os degraus 2 e 3: os runtimes; os `esperado.json` de
A-025/A-026 pela pilha (mudam junto com o runtime); os 15 casos pendentes
entram em `casos/`. O `site/` ainda aponta em dois links para o nome antigo
da spec (é do D11, casca do site).

Cada versão do programa tem o seu subtítulo, `### vN.N — o que mudou — data`,
a mais nova em cima (lote A7). Dois chats no mesmo dia acrescentam cada um o seu,
sem se cruzar: o número vem do `versao.py`, que recusa número repetido.

### v13.2 — Limpar chaves repetidas: tira o lixo do gravar-sozinho, sem tocar no que é de propósito — 14/09/2026

Chat "LINHA DO TEMPO", item 8 do plano "linha do tempo — copiar e colar" (o
último dos dois que faltavam). Comando novo, **Animação → Limpar chaves
repetidas** (também pela Paleta de comandos, `Ctrl+Shift+P`): tira a chave que
não muda nada — o rastro que o gravar-sozinho deixa quando se mexe num osso e
se volta ao mesmo lugar. Linha escolhida (marcada na folha, ou pela seleção)
limpa só ela; sem nenhuma, limpa a animação inteira, como "Fechar ciclo". Um
passo de desfazer só, e a barra de baixo diz quantas saíram — e quantas eram a
ponta da linha.

**Duas cautelas, para o comando nunca comer o que é de propósito:**
- Uma chave `parada` (`stepped`), e a que recebe um degrau parado, nunca
  saem — repetida no valor não quer dizer inútil no tempo.
- Linha não numérica (`attachment`, `event`, `drawOrder`, `sequence`,
  `tag`…) nunca entra: já é sempre "parada" por natureza, mesmo sem o campo
  `curve` escrito.

**O que prova que um comando que apaga é seguro não é o que ele apaga: é o
que ele se recusa a apagar.** Testado na tela, no herói: chaveei sete
propriedades do osso `hips` em quatro tempos — `rotation` e `x` com três
chaves repetidas e uma diferente no fim, as outras cinco (`y`, `scaleX`,
`scaleY`, `shearX`, `shearY`) inteiramente constantes. O comando tirou **19
chaves, 7 delas na ponta da linha**; as cinco linhas constantes **encolheram
até UMA chave cada, nunca até zero**. Marquei uma chave como "Parada" e rodei
de novo: ela e o valor dela **saíram intactos do outro lado**, só a vizinha
sem marca saiu (2 chaves, 1 na ponta). Um `Ctrl+Z` devolveu tudo inteiro nas
duas rodadas, um passo só.

### v13.1 — Empurrar as chaves por número: a porta para uma função órfã — 14/09/2026

Chat "LINHA DO TEMPO", item 4 do plano "linha do tempo — copiar e colar".
Comando novo, **Animação → Empurrar as chaves…** (também pela Paleta de
comandos, `Ctrl+Shift+P`): pergunta quantos quadros e para que lado, com uma
chave marcada na folha.

**O registro que vale mais que o comando em si.** `rippleMove`
(`anim/keying.ts`) já existia, com teste, verde há semanas — e nenhum gesto
chegava nela: as três teclas do arrasto de uma chave já tinham dono (`Ctrl`
clona, item 6; `Shift` soma à seleção; `Alt` tira o encaixe do quadro). Ela
era uma função órfã. Este item não escreveu conta nova: deu porta a essa
função. Fica escrito aqui para ninguém "descobrir" daqui a um ano que ela não
é usada e apagá-la.

Duas contas, escolhidas na própria janela:
- **Estas e tudo o que vem depois** — abre espaço no meio de uma animação
  pronta (`rippleMove`), o pedido do Humberto;
- **Só as chaves marcadas** — a mesma conta do arrasto do mouse (`moveKeys`).

Um passo de desfazer só, e a barra de baixo diz quantas chaves andaram.

**Achado na tela, não na suíte:** a primeira versão escrevia "3 chaves
andou" — verbo sempre no singular, porque texto errado não quebra teste
nenhum. Corrigido para concordar com a conta ("andou"/"andaram") antes do
fecho.

### v13.0 — Malha e pesos: menos recheio, sem esconder nada — 14/09/2026

Chat "MALHA", peça pequena a pedido do planejador. A aba "Malha e pesos" tinha
961px de sobra em 1440×900 e 1.083px em 1280×720 (painel vazio, `npm run
medir`) — a maior de todas. Apertado só o recheio (padding do corpo e das
seções, altura mínima de campo, borda e altura mínima de botão), sem tirar um
campo, um osso ou um botão sequer: 961→372px e 1.083→494px.

**Não fechou, e o porquê é largura, não CSS.** Os botões desta aba carregam o
nome por extenso ao lado do ícone — pedido do Humberto de 13/09, "ícone
sozinho não se lê" — e um nome como "Gerar automática" não cabe dois por
linha numa coluna de ~220px. Cinco botões só na seção Forma, cada um numa
linha inteira; apertar mais sem cortar palavra esbarra na largura da coluna.
A conta antiga de "precisa de 419px" (13/09) contava Ossos e Pesos como
seções que poderiam dobrar; o pedido de 14/09 fechou essa porta — a régua da
casa proíbe esconder o que ele usa para ganhar número verde. Com os dois
sempre abertos, a conta certa é a de agora, e não fecha sozinha: falta a
decisão dele entre nome mais curto, coluna mais larga, ou a aba rolar como a
Prévia já rola. As três saídas estão escritas no `ESTADO.md`.

### v12.9 — Copiar a pose do escolhido, um comando próprio; Ctrl clona a chave — 14/09/2026

**O defeito que eu mesmo causei e consertei, escrito porque vale mais contado
do que calado.** A primeira versão do item 9 fazia `Ctrl+Shift+C` ("Copiar a
pose") mudar de sentido conforme a seleção — pose inteira sem nada escolhido,
só o membro com um osso escolhido. Passou em todos os testes, e quebrou o
Roteiro dos 30 minutos: o passo 11 tinha um osso escolhido e pedia a pose
inteira, e levou só o braço. **Comando que muda de sentido conforme a seleção
é armadilha** — a mão escolhe um osso para mexer nele, depois pede a pose
inteira sem lembrar que algo ainda está selecionado, e leva menos do que
pediu, sem aviso. A lei resolveu: no Spriter, "Key all" e "Key selected" são
DOIS botões, nunca um só variando.

- **Copiar a pose** (`Ctrl+Shift+C`) volta a ser SEMPRE a pose inteira.
- **Copiar a pose do escolhido**, comando novo e próprio, no menu Animação:
  só a pose do osso ou slot escolhido (e os filhos dele).
- **`Ctrl` ao arrastar uma chave clona**, deixando a original onde estava —
  gesto de Spriter, item 6.

**A segunda descoberta, no caminho do item 6, é a décima defeito silencioso
da família em dois dias, e a mais bem-acabada de todas:** `Ctrl` no arrasto
de chave já tinha dono — "empurrar as seguintes junto" (item 89) — só que ele
nunca funcionava. A função (`rippleMove`) existia, tinha teste, passava
verde; o gesto nunca chegava nela, porque um `return` antecipado no código do
clique matava a linha que o ligaria, sem ninguém notar. **Teste de função não
prova gesto** — é a lição que faltava depois da prova de salvar/fechar/reabrir
(v12.7), que já tinha ensinado "teste de função não prova volta ao disco".
`Ctrl` agora clona; `rippleMove` e o teste dela ficam guardados, sem gesto,
até o Humberto escolher uma porta própria (um interruptor na folha, como o
Spine, por exemplo) — função guardada com o motivo escrito não é lixo; função
guardada sem motivo é.

Chat "LINHA DO TEMPO".

### v12.8 — As chaves de depois vão junto: trocar de pai no meio da animação ficou sem letra miúda — 14/09/2026

Chat "CHAVE PARENT". A ponta solta que a v12.6 deixou anotada, e que o Diretor
resumiu numa frase: *meia entrega apodrece mais rápido que assunto não
começado.*

Até aqui, depois da chave `parent` (§9.4), as poses que a pessoa já tinha
gravado **continuavam medidas do pai velho**, e a barra só avisava. Quem
animasse depois da troca via o braço saltar e não sabia por quê. Agora elas são
**convertidas** para o espaço do pai novo, no mesmo comando e no mesmo passo de
desfazer, e a barra diz **quantas foram** — número, não adjetivo:

> arma virou filho de cape1, por chave em 0,30 s. 1 chave depois desta foi
> convertida para o pai novo

**O critério é o do Spriter, e é de conferir com os olhos: a pose de cada chave
fica onde estava.** Na prova de tela, com o herói: uma pose gravada em 0,6 s e a
troca em 0,3 s; o mundo da arma em 0,6 s sai **idêntico** antes e depois —
`49,392 / 76,771`, a mesma matriz —, com outro pai debaixo dela. O teste prende
a matriz inteira (`a`, `b`, `c`, `d`), e não só a posição, porque foi olhando o
mundo que os defeitos silenciosos de ontem apareceram.

**Por que seis chaves, e não só as que existiam.** No instante convertido, as
seis propriedades de pose (`x`, `y`, `rotation`, `scaleX`, `scaleY`, `shearY`)
ganham chave, mesmo as que não tinham nenhuma. Parece exagero e não é: uma
propriedade **sem** chave ali continuaria interpolando um valor escrito para o
pai **velho**, e a pose daquele quadro sairia torta — que é exatamente o defeito
que esta peça conserta. Quem for "limpar" essas chaves um dia, leia esta linha
primeiro.

Os limites, porque reescrever chave que a pessoa criou é a coisa mais séria que
um editor faz:

| Regra | Por quê |
|:---|:---|
| Só o osso da troca | A chave de outro osso não é assunto desta troca |
| Só depois dela | O que veio antes foi escrito para o pai de antes, e continua certo |
| Para na **próxima chave de pai** | Dali em diante quem manda é ela, e aquele trecho já foi escrito pensando naquele outro pai |
| O `shearX` é preservado | A mesma conta exata da v12.6: `rotation − s`, `shearY + s` |

Com esta peça, **o caso da arma fica inteiro**: trocar de pai no meio da
animação deixou de ter letra miúda.

### v12.7 — A prova de salvar, fechar e reabrir — 14/09/2026

Nove defeitos silenciosos em dois dias, e a maior parte da mesma família:
"ninguém confere a volta". O programa diz que guardou e não guardou; o painel
diz que voltou ao padrão e volta errado no dia seguinte. Nenhum dava erro.
Todos passavam nos testes. Esta peça é a resposta: o passo 14 do
`roteiro-30.mjs` (`npm run roteiro`) passa a fechar de verdade.

- **O passo 14 fecha de verdade.** Recarrega a página inteira (`Page.navigate`),
  não só limpa a memória — e os bytes da pasta salva atravessam por FORA da
  página, guardados do lado do script, como um disco atravessaria.
- **A janela "havia trabalho não salvo, quer recuperar?" é RECUSADA de
  propósito.** Aceitá-la mascararia o teste: o documento voltaria do rascunho
  automático, não do arquivo salvo na pasta. Esse achado é o coração da
  prova — uma rede que se engana sozinha não é rede.
- **O `.bone` salvo não pode levar arranjo de tela para dentro.** Só os cinco
  campos que o contrato permite (`camera`, `selection`, `animation`, `skins`,
  `view` — `contract.ts`); a arrumação dos painéis mora na máquina desde a
  v12.5, e a prova agora confere isso no arquivo, não só confia no tipo.
- **O diff diz QUAL item não voltou**, não só o nome do campo: o índice do
  osso ou da animação que mudou, com o valor de antes e o de depois.

Chat "LINHA DO TEMPO", pedido à parte do Planejador.

### v12.6 — A arma vai para as costas no meio da animação; copiar o braço inteiro; a malha deixa de expulsar — 14/09/2026

Três lotes num fecho: a **chave `parent`**, o **copiar e colar** da linha do
tempo e a **malha em Animando**. A régua do dia, do Humberto: *"como o Spriter
faz? Isso é lei. Como o Spriter faz, pra ele isso é muito fluido."*

**O que este dia ensina, e por isso vem primeiro: três defeitos que só
apareceram na TELA.** Os três passavam na suíte inteira, verdes. Os três
apareceram porque alguém abriu o programa e fez o gesto com a mão.

| # | O que se via | Por que o teste não pegava |
|:---:|:---|:---|
| 1 | A espada **deslizava para as costas desde o começo** da animação, em vez de ir de uma vez no quadro da troca | O valor final estava certo — o **caminho** entre as chaves é que estava errado. Nenhum teste olhava o meio do caminho |
| 2 | A Árvore mostrava *"por chave"* em **qualquer** quadro | O painel não ouvia o tempo: desenhava a hierarquia do instante em que tinha sido desenhado pela última vez |
| 3 | O aviso da malha continuava na tela **depois de voltar para a Montagem**, dizendo que a edição ia para a pose de repouso quando não havia animação nenhuma aberta | Nenhum teste conferia o que fica na tela **depois de trocar de modo duas vezes** |

---

#### 1. A chave `parent`: a arma sai da mão e vai para as costas (§9.4)

Chat "CHAVE PARENT", lote 1 do plano `PLANO fluxo criar e animar - lotes 1 e 2 - 2026-09-14.md`.

O caso, nas palavras dele: *o personagem segura a arma e guarda ela nas costas
no meio da animação*. A arma muda de pai e de ordem de desenho. A ordem já era
chave desde o lote 66; **o pai é o que faltava**.

No Spriter a hierarquia é definida por chave, e o programa nunca pergunta nada.
Aqui também:

| Onde | O que o gesto faz |
|:---|:---|
| **Animando** | grava a chave `parent` no tempo de agora, **sem janelinha e sem perguntar** |
| **Montagem** | muda o pai no arquivo, como sempre |

Sumiu o *"estrutura muda na Montagem, e voltei para ela"*: **ninguém é mandado
de volta**. Os quatro gestos — a tecla `P`, o arrasto na Árvore, o campo do
painel e o menu — continuam passando pela mesma porta, que agora se ramifica.

- **O desenho não salta.** Os locais são medidos do pai novo e gravados junto,
  num passo de desfazer só (§9.4: quem grava a chave grava os locais; o runtime
  não converte nada). E, no **quadro anterior**, cada local ganha uma chave
  `stepped` que segura o valor de antes — é o conserto do defeito 1, e é o que
  faz a troca ser o evento seco que ela é.
- **A Árvore mostra o pai do quadro de agora.** No quadro 12 a arma está nas
  costas, e a Árvore diz isso, com *"por chave"* na linha de quem está ali por
  causa de uma chave. Ela anda no tempo — e só se redesenha quando há chave de
  pai, para arrastar o cursor não custar uma árvore inteira por quadro.
- **O `shearX` não se perde.** A decomposição de §5.5 devolve sempre zero, e
  escrever esse zero por cima entortaria um rig inclinado, calado. A mesma
  matriz se escreve com `rotation − s` e `shearY + s`; o teste prende a matriz
  inteira, não só a posição.
- **O ciclo é medido na árvore aplicada**, a daquele quadro, e não a do
  arquivo: um editor que deixa gravar uma chave que o runtime vai ignorar
  (`PARENT_CYCLE`) é um editor que mente para quem está animando.
- **Desenho não troca de osso por chave.** A §9.5 não tem timeline para o osso
  dono de um slot. Com osso e desenho escolhidos juntos, o osso ganha a chave e
  a barra de baixo diz por quê. É uma diferença real para o Spriter, onde o
  objeto também troca de pai por chave — fazer igual é campo novo no núcleo, e
  é decisão do Humberto.
- **Provisório, escrito nos Desvios:** chaves de pose que já existam **depois**
  da troca continuam medidas do pai antigo, e a barra avisa. O certo é
  convertê-las ao gravar a troca, num passo de desfazer, dizendo quantas foram
  convertidas. Fica para um lote próprio: reescrever chaves que a pessoa criou
  é a coisa mais séria que um editor faz.

O formato, o runtime e os 53 casos de conformidade **já faziam tudo isto** — o
caso C-281 é exatamente o cenário da arma. Este lote é só o editor aprendendo a
escrever o que o formato já sabia ler.

#### 2. Copiar e colar na linha do tempo: a seleção da cena vale

Chat "LINHA DO TEMPO". O Humberto, sobre o Spriter: *"pego o braço inteiro e colo."*

- **Copiar vale a seleção da cena ou da Árvore.** Escolher o osso ou o slot e
  apertar Copiar (`Ctrl+C`) basta — não precisa mais marcar chave por chave na
  folha.
- **Copiar leva o membro inteiro.** O osso escolhido leva as chaves dele E as
  de todos os filhos, a mesma conta do Duplicar — sem precisar de "Escolher
  filhos" antes.
- **Colar espelhado**, novo no menu Animação: o braço direito animado vira o
  esquerdo ao colar, pela regra de nome `_e/_d` (a mesma caixa de "Espelhar
  esquerda e direita").

#### 3. A malha e os pesos deixam de expulsar em Animando

Chat "MALHA", lote 2 do mesmo plano. A ferramenta Malha e a ferramenta Pesos
existiam só em Montagem; com uma animação aberta, cinco botões da aba ficavam
cinza e ligar um osso era recusado, com a mensagem *"Volte à Montagem"*. As duas
passam a valer nos dois modos — eram as duas últimas restritas por modo, e a
porta escondida de verdade estava no `modes` das ferramentas, não no painel. Uma
terceira porta, irmã das outras: ligar a ferramenta sozinha também era recusado
em Animando.

**O cuidado do lote.** Forma e pesos continuam sempre indo para a pose de
repouso — o formato não tem como animar topologia, só deformação (`deform`,
§7.4). Mover um vértice já fazia a conta certa; o que mudou foi tirar o bloqueio
de todo o resto e pôr **uma linha só**, no topo da aba: *"A forma e os pesos
valem em todas as animações; só arrastar um vértice grava uma chave."* Ligar um
osso à malha em Animando agora acontece, e o rodapé diz *", na pose de repouso"*.

### v12.5 — Descolar o painel da lateral, e a bancada sai de dentro do personagem — 13/09/2026

O Humberto testou a v12.4, arrastou a aba "Ordem" para cima da cena e mandou a
foto: *"tentei mover menu pra lá, não foi"*. E antes: *"descolar os menus da
barra lateral; ok não fazer pop up, mas seria bom poder descolar como no
Photoshop"*.

A distinção é dele, e vale registrar: **flutuar dentro da janela do editor**,
sim; janela do sistema, não.

---

#### O painel descola

Arrastar a aba para fora de qualquer tira solta o painel: ele passa a flutuar
sobre a cena, com barra de título, um `×` que o fecha e um canto que muda o
tamanho. Arrastar a barra de título até uma tira o **cola de volta**, no grupo e
na posição onde foi solto — e a tira **acende** enquanto a mão ainda segura,
como já acontecia no arrasto de aba.

É o mesmo painel, e não uma cópia: o `host` muda de casa. Remontá-lo o faria
perder a seleção e a rolagem, e um painel que se esquece do que estava aberto é
pior que um que não descola.

**Como os programas fazem**, olhado antes de desenhar o gesto:

| Programa | Descola? | Como |
|:---|:---|:---|
| Photoshop | **sim** | arrastar a aba para fora solta o painel, que flutua sobre a arte com barra própria; arrastar a barra de volta à borda o cola |
| Spine | **sim** | as *views* saem da lateral e flutuam sobre a cena |
| Spriter | **não** | painéis fixos |
| DragonBones | **não** | painéis fixos |

Os dois que fazem, fazem igual — e **aqui o gesto já existia**: era o arrasto de
aba entre grupos, do lote 19. Ele só passou a valer também **fora** da tira. Não
houve modo novo nem janela a mais, que é a régua do Spriter.

**As duas armadilhas, fechadas com número.** Um flutuante puxado para (9000,
9000) para com **48 px de barra ainda pegáveis**, dos dois lados — painel que
sai inteiro da tela é painel perdido. E ele nunca passa de 80% da cena. A
camada onde eles moram é `pointer-events: none` inteira: só as caixas pegam o
ponteiro, e **a cena não perde um clique** — descolar um painel não pode
quebrar o desenho, que seria a pior troca possível.

O `×` da barra fecha, e **Janela → nome** traz de volta **para a coluna**, que é
onde o painel estava antes de tudo. **Voltar ao padrão** recolhe todos os
flutuantes de uma vez: é o resgate de um painel que ficou onde não se pega mais.

---

#### A BANCADA SAIU DE DENTRO DO PERSONAGEM

Nove campos de arranjo iam para dentro do `.bone`, no bloco
`RECORTE_editor_state`: os grupos, a aba à frente, o recolhido, o fechado, o
flutuante, a largura das colunas, as colunas escondidas e a faixa de baixo.

Duas coisas erradas saíam disso. A primeira: abrir o `.bone` de outra pessoa
reorganizava a tela de quem abriu. A segunda é a que decide, e é o motivo deste
conserto: **o arranjo viajava dentro do `.bone` que ele PUBLICA. Um personagem
entregue não pode carregar quais painéis estavam fechados na máquina de quem
salvou.** Isso não é do personagem.

A linha, daqui em diante: **documento no arquivo, bancada na máquina.** O
`.bone` fica com a animação aberta, a câmera, a seleção, as peles à vista — o
que é do personagem. O arranjo vai para a máquina, onde a divisão de altura já
estava.

**O legado:** se não houver nada na máquina, lê-se **uma última vez** o que
estiver no arquivo, e nunca mais se grava. Ninguém perde a tela que já tem, e o
campo morre sozinho. **O bloco não é apagado do arquivo de ninguém** — apagar o
que é de alguém sem ele pedir é mexer no arquivo de alguém; ler e ignorar basta.

#### Como o errado nasceu, e por que isto é a lição mais instrutiva do dia

O lote 52 **acertou** o raciocínio, para um campo só — a divisão de altura — e
deixou o motivo escrito ao lado: *"é da máquina de quem trabalha, e não do
personagem — abrir outro arquivo não pode devolver a Árvore ao tamanho de
fábrica"*. Os outros oito campos foram sendo acrescentados por cima, cada um
seguindo o vizinho. **Dois deles neste mesmo dia, por quem escreve isto.**

**Ninguém decidiu o errado: o errado foi crescendo por imitação.** A pergunta
que faltou não era *"isto está certo?"* — era ***"por que o vizinho faz
assim?"***.

É a sexta coisa errada achada em 13/09/2026, e a diferente. As outras cinco
eram a mesma família — *ninguém confere a volta*:

| # | O que | Como mentia |
|:---:|:---|:---|
| 1 | a medição da aba Malha e pesos | media o painel vazio e dizia "cabe" |
| 2 | a marca `data-rolagem="palco"` | isentava em vez de trocar a régua |
| 3 | o estado da coluna na prova | atravessava um recarregamento |
| 4 | o recolher e a divisão da v12.2 | não eram gravados: valiam na sessão e sumiam ao reabrir |
| 5 | o campo `floating`, hoje | o mesmo buraco do 4, de novo — achado em vinte minutos, porque desta vez o gesto foi conferido na tela antes de dizer "pronto" |

A quinta é a segunda do mesmo autor, e é por isso que o teste de ida e volta
agora existe: ele serializa o estado, relê e confere que o flutuante volta com a
caixa exata. **Prender a lição num teste é o que impede a sexta repetição.**

---

Testes: **2.773 → 2.793** (2.764 passam, 29 pulados: o manual pausado).
`tsc` limpo · conformidade 53 de 53 · roteiro 14 de 14 · medições 22 de 22 de
lado e 15 de 22 de altura.

**Fica para o lote seguinte:** a quina — criar grupo novo arrastando a aba para
a borda, com a sombra da ÁREA — e pendurar no `roteiro-30` a prova de salvar,
fechar e reabrir de verdade, que é a única que pega a família de erros que
mordeu cinco vezes hoje.

### v12.4 — O menu Janela era um interruptor que só ligava — 13/09/2026

O Humberto, testando a v12.3: *"não dá pra fechar um menu e depois abrir ele em
'janelas'. O menu janelas não funciona."*

Ele estava certo, e o defeito era maior que um item quebrado.

---

#### A LIÇÃO DO DIA, e ela vale mais que tudo o que está abaixo

**Entregar "fica guardado" sem reabrir e conferir é da mesma família das três
mentiras da prova: ninguém confere a volta.**

Quatro coisas deram errado hoje, e as quatro são a mesma coisa:

| O que | Como mentia |
|:---|:---|
| A medição da aba Malha e pesos | media o painel **vazio** e dizia "cabe" |
| A marca `data-rolagem="palco"` | **isentava** o painel em vez de trocar a régua dele |
| O estado da coluna na prova | **atravessava** um recarregamento e a rodada media outra tela |
| O recolher e a divisão da v12.2 | eram gravados na memória e **não no arquivo**: valiam na sessão e sumiam ao reabrir |

Nenhuma das quatro dava erro. Todas saíam **verdes**. Em três delas o número
até MELHOROU sozinho — e foi por isso que se olhou duas vezes. A regra que fica:
**quando um número melhorar sozinho, desconfie antes de comemorar; e quem
escreve "fica guardado" tem de fechar e reabrir antes de escrever.**

---

#### O menu Janela (chat 2)

**Não existia como fechar um painel. Nenhum.** Zero botões de fechar na tela, e
o menu Janela só ABRIA — embora cada item tivesse marca de seleção, que é o
desenho universal de um interruptor. O que ele tentou fazer era impossível:
faltava a primeira metade do gesto.

**E a marca mentia.** Ela queria dizer "está à frente do grupo", e não "está na
tela": medido no navegador, **onze abas na coluna e o menu marcando cinco**.
Quem abria o menu para achar um painel via a lista dizendo que quase tudo
estava fechado. Agora "aberto" quer dizer o que a palavra diz.

O que entrou:

- **Um `×` fecha o painel**, na aba em uso. Ele aparece só ali: onze xis ao
  mesmo tempo, na tela de quem no mesmo dia reclamou de tela cheia de coisa,
  seria trocar um problema por outro.
- **O menu Janela traz de volta, no lugar de onde o painel saiu.** Porta de
  volta que leva a outro cômodo não é porta de volta: quem fecha a aba do meio
  espera encontrá-la no meio.
- **O botão direito na tira fecha o grupo inteiro**, com **Janela → Fechar o
  grupo** como porta visível e a barra de baixo ensinando o gesto na primeira
  vez que alguém fecha um painel. Ele já foi botão na tira, e saiu por conta:
  27 px de largura ali faziam a tira quebrar em duas linhas, e cada linha a
  mais tira 33 px de altura do painel.
- **Grupo vazio some inteiro** e devolve a altura — a tira sem aba nenhuma não
  é um painel recolhido, é um painel que não está ali. Ele volta quando um
  painel seu volta.
- **O último painel aberto não se fecha**, como o último grupo não se recolhe:
  a coluna nunca fica muda. Quem quer a tela inteira tem o `Tab`.

**A regra que vale para tudo isso: nada some sem porta de volta.** A decisão
antiga — "o item do menu só abre" — não foi descuido, foi **cuidado**, escrito
quando fechar um painel era o mesmo que perdê-lo. O cuidado continua certo. O
que mudou é que agora existe a lista onde o painel fechado fica escrito, e é ela
que torna o fechar seguro.

**O defeito da v12.2, escrito aqui porque foi esta versão que o achou.** O que
se guardava da coluna eram três campos; `collapsed`, `autoSplit`, `focus` e
`closed` ficavam de fora, e a casca **relê tudo do que foi guardado**. Ou seja:
o botão de recolher e a divisão automática entregues naquela versão valiam na
sessão e **se perdiam ao reabrir o arquivo** — embora o CHANGELOG dela diga que
iam para o estado do editor. Foi esse mesmo buraco que, na primeira tentativa,
fez fechar um painel **movê-lo** para o outro grupo em vez de fechá-lo. Sete
campos gravados agora.

#### A malha (chat 4)

A sobra caiu de **961 para 634 px**. O recado que morava preso dentro da aba,
custando 61 px de altura, foi para a barra de baixo — lugar de recado é a barra,
não o meio da ferramenta. E os dois botões de aresta viraram um.

#### Propriedades e Exibição (chat 1)

Os dois encolheram **só com recheio, sem perder um campo sequer**: Propriedades
para 71 px de sobra em 1440×900, Exibição para 73. E, com o grupo vizinho
fechado, **os dois zeram em 1440×900** — cabem inteiros, conferido na tela.

Uma nota sobre um número que assustou: a Exibição foi vista oscilando de 73 a
196 px entre rodadas, sem ninguém mexer nela. Medida de novo com a árvore
parada, três rodadas seguidas: **67 e 190 px, idênticos nas três**. Era a obra
ao lado — a coluna mudando debaixo dela enquanto o outro lote acontecia —, e não
mais um número falso. A prova está firme.

---

Testes: **2.760 → 2.773** (2.744 passam, 29 pulados: o manual pausado).
`tsc` limpo · conformidade 53 de 53 · roteiro 14 de 14 · medições 22 de 22 de
lado e 15 de 22 de altura. O que ainda não cabe está no `ESTADO.md`, na seção
"Cabe na tela grande, rola na pequena", com os dois números de cada um.

### v12.3 — A coluna do jeito dele: a aba cai onde o dedo solta, e a Prévia cabe — 13/09/2026

O Humberto: *"tá faltando arrastar para criar meus grupos... e vários outros
tipos de personalização de menus"*, e antes disso: *"quero formas de organizar o
menu do meu jeito; todo programa faz isso"*. Ele tem razão de que todo programa
faz. Esta é a **primeira metade**: arrumar, e poder desfazer. A segunda —
criar grupo pela quina, esconder painel, fechar e reabrir grupo — vem no lote
seguinte, e ele testa esta antes.

---

#### A aba cai onde o dedo solta

Arrastar a aba já levava ela para o outro grupo desde o lote 19. Mas ela caía
**sempre no fim da tira**: dava para mudar de grupo e nunca de lugar dentro
dele. Agora ela entra exatamente onde foi solta, e **reordenar as abas do grupo
passou a existir**.

A conta é pura (`dropIndex`, em `panel-groups.ts`) e trata a tira quebrada em
várias linhas, que é o caso de todo dia num grupo de cinco abas: o `y` escolhe a
linha, e dentro dela o **meio** de cada aba é a fronteira — não a borda. Soltar
no vão entre duas linhas cai na mais perto, sem estourar a conta.

**A sombra, com as palavras dele:** *"no Photoshop, se eu encosto nas quinas, a
janela se adapta, 'cola' no lugar"*. Enquanto a mão ainda segura, uma barra azul
de 3 px aparece do lado em que a aba vai entrar. Sem ela o arrasto é
adivinhação: solta-se e só depois se descobre onde foi parar. Ela sai sozinha
quando o ponteiro deixa a tira e quando o arrasto acaba no vazio — **largar fora
não move nada, não deixa barra esquecida e não gasta um passo de desfazer**.

**O que os três programas fazem, olhado antes de desenhar o gesto** — e isto
fica escrito para quem ler daqui a um mês não achar que foi capricho:

| Programa | Reorganiza? | Como |
|:---|:---|:---|
| Spriter | **não** | painéis fixos: file palette, animation palette, z-order, hierarchy, object properties, cada um no seu canto |
| Spine | **sim** | cada painel é uma *view* com aba, e as abas se arrastam de um lugar para outro |
| DragonBones | **não** | painéis fixos por função |

Dois dos três não deixam. O terceiro deixa arrastando a aba — e é esse caminho
que o Recorte já tinha tomado no lote 19, **pela metade**. Então não havia gesto
novo a inventar: pela régua do Spriter, que é o gesto mais curto, sem modo novo
e sem janela a mais, **completar o que já existia era mais curto que qualquer
coisa que se pudesse acrescentar**.

#### O "Voltar ao padrão" estava QUEBRADO, em silêncio

O item existe no menu Janela desde o lote 16. Ele arrumava a tela na hora — e
**a próxima abertura desarrumava tudo de novo**, porque o `localStorage`
continuava com a divisão antiga e o automático desligado. Quem usasse o item
veria os painéis voltarem ao lugar, fecharia o programa satisfeito, e no dia
seguinte encontraria a bagunça de volta, sem entender por quê. Agora ele grava
também as divisões: **voltar ao padrão volta de verdade, inclusive amanhã.**

Achado de passagem, ao escrever o item 6. Fica registrado porque defeito
silencioso é o que mais vale registrar: ninguém abre um chamado para uma coisa
que parece ter funcionado.

#### A Prévia cabe

**A regra que decide quando um botão vira desenho: ícone só quando o desenho é
universal.** Foi por isso que os botões do painel de malha voltaram a ter NOME
neste mesmo dia e os do tocador não: `▶`, `❚❚`, `■` e `⏮` são os de qualquer
tocador — e são os mesmos que a linha do tempo já usa aqui do lado —, enquanto
"Criar aresta" não tem desenho que se leia. **"Tela cheia" ficou com o nome
escrito**, e é o exemplo da regra, não uma exceção envergonhada: o símbolo dela
não é da família do tocador e nem toda fonte o desenha. Barra meio símbolo meio
palavra é menos bonita que uma barra só de símbolos, e é a que se lê.

A barra passou a caber numa **linha só**, em vez de duas, e devolveu 46 px de
altura ao painel: o corpo foi de 274 para **321 px** em 1440×900 e de 152 para
**198** em 1280×720. O palco tem 160 px e agora cabe nos dois.

**E a Prévia ganhou régua própria na medição.** Decisão do Humberto: um painel
com palco **pode** rolar. O palco é um canvas de proporção fixa, e nenhuma
arrumação de conteúdo faria a Prévia inteira caber — dobrar mais só esconderia
melhor. A régua dela passa a ser **o palco inteiro, e o começo do que vem depois
dele, à vista sem rolar**: abrir a aba tem de mostrar o palco e dizer que há
mais coisa abaixo.

#### Uma marca que ISENTA é o falso verde com roupa nova

A marca de palco nasceu errada, e o erro é o mesmo que a v12.2 registrou como o
mais perigoso do dia — doze horas depois. Ela foi posta no `.painel-corpo`
enquanto a prova olhava o `.panel-group-body`: **a régua do palco nunca rodou**,
e a marca só ISENTOU a Prévia, igual à marca de lista. A prova passou a dizer
"cabe" nas duas medidas, e estava errada nas duas.

Pego porque foi conferido em vez de comemorado: o detalhe mostrava palco de 160
px num painel de 152. Corrigido — **a marca troca a régua, nunca isenta** —, e
está escrito assim no código, onde a próxima marca vai ser escrita.

---

Testes: **2.752 → 2.760** (2.731 passam, 29 pulados: o manual pausado).
`tsc` limpo · conformidade 53 de 53 · roteiro 14 de 14 · medições 22 de 22 de
lado e **16 de 22 de altura**. Os três que continuam vermelhos estão nomeados no
`ESTADO.md`, com os números e o dono.

### v12.2 — A coluna dá espaço: recolher, e a altura vai para quem está trabalhando — 13/09/2026

Três chats numa rodada. O fio que os liga é o mesmo: **o Humberto não reclamou
de rolar, reclamou de ler.** *"É uma wikipédia"*, sobre o painel de malha; e
depois, sobre a coluna inteira: *"aposto que tem muito espaço mal otimizado; eu
arrasto quando vou usar outra coisa... podia ter também botões para recolher
quando não estivesse usando"*.

---

#### A coluna (chat 2)

**Botão de recolher em cada grupo.** No fim da tira de abas, com o nome de cada
painel do grupo na dica — "Recolher: Animações, Peles, Regras, Histórico, Malha
e pesos". Recolhido, fica só a tira, e a altura vai **inteira** para o outro
grupo. Clicar no nome de uma aba de um grupo recolhido o abre: botão que mente
não serve. O último grupo aberto não se recolhe, senão a coluna viraria duas
tiras sem painel nenhum — quem quer a tela toda tem o `Tab`, e a barra de baixo
diz isso na hora. O estado vai no `RECORTE_editor_state`, nunca no `.bone`.

**A altura vai para quem está trabalhando.** A divisão era **0,58 fixa**, e não
olhava para onde a pessoa estava. O resultado, medido: a Prévia recebia 213 px
e precisa de 405; em 1280×720 a aba Animações não mostrava **nenhuma** animação,
só a barra de ícones. Agora o grupo com a aba em uso leva **0,68** e o outro o
resto; escolher uma aba muda quem é o grupo em uso.

Três decisões que se afastaram da letra do pedido, e o porquê de cada uma:

| Decisão | Por quê |
|:---|:---|
| **0,68 ao grupo em uso, e não tudo** | "Tudo" faria o outro virar uma tira a cada clique, e a coluna existe justamente para ter **dois painéis à vista**. Quem quer um só agora tem o botão de recolher, que é explícito e fica onde a pessoa o deixou |
| **A mão vence a conta** | Arrastar a alça desliga o automático naquele lado, para sempre: um programa que arruma sozinho o que a pessoa acabou de arrumar é pior que um programa que não arruma nada. E **dois cliques na alça devolvem o automático** — é como se desfaz um arrasto de que ela não gostou, sem ter de acertar o pixel de volta na mão |
| **O navegador guarda `{ split, auto }`, e não o número solto** | Sem a marca, o número gravado (mesmo sendo o de fábrica) voltaria mandando, e a divisão automática **nunca valeria da segunda abertura em diante**. Um valor antigo, número solto, é lido como mão: antes deste lote ele só era gravado depois de um arrasto |

**A prova de altura.** A medição dos painéis só olhava a LARGURA — um painel
podia caber na coluna e ainda assim pedir meia tela de rolagem para baixo, e foi
por aí que a "wikipédia" passou. A régua nova, em uma frase: **o que rola tem de
ser lista que cresce com o arquivo, nunca texto fixo do painel.** A Árvore de
dezoito ossos vai rolar sempre, e tem de rolar. A caixa que é uma lista leva
`data-rolagem="lista"` no HTML, uma linha no painel que a cria — a marca é do
painel, porque quem sabe se algo é lista é quem o desenha.

**E a prova estava dando um falso verde.** A aba Malha e pesos aparecia "cabe"
em 1280×720 — mas a medição pegava o painel **vazio**, com a frase "Escolha um
desenho na árvore ou na tela" no lugar do painel inteiro: a seleção da malha se
perdia quando o Vite recarregava a página no meio da prova. Agora a seleção é
reafirmada antes de cada aba, e **o número caiu de 15 para 14 de 22**. Fica
escrito com todas as letras, porque é o defeito mais perigoso que apareceu:
**uma prova que mede tela vazia sai verde e não prova nada**, e o número
honesto vale mais que o número bonito.

No mesmo espírito, a prova deixou de cair sozinha: o Vite recarrega a página
quando alguém salva um arquivo, e com vários chats trabalhando isso acontecia no
meio da medição — ela morria com "__m is not defined". Agora ela reabre o
editor, repete a aba, e **escreve no relatório que aconteceu**: recupera-se, não
disfarça. Ganhou também `--detalhe ABA`, que imprime a altura de cada pedaço de
um painel: é como se acha quem come a altura, em vez de adivinhar lendo o CSS.

**A Prévia** mostrava as QUATRO camadas e a caixa de copiar abertas o tempo
todo: 1.933 px num painel que recebia 213. Agora só a camada 0 nasce aberta, e
uma camada com animação escolhida abre sozinha — o que foi configurado nunca
some. Conteúdo: **1.933 → 692 px**. Ela ainda rola, e a conta está escrita no
`ESTADO.md`: o que sobra não é mais texto, é o tamanho do palco.

**A aba Animações** passava 21 px da altura em 1280×720. A causa não era a
lista, que já rola: era o `padding: 4px 0 16px` do corpo, e recheio **não
encolhe** — num painel baixo esses 20 px eram o mínimo irredutível. O mesmo
espaço foi para dentro da lista, que rola, e o corpo passou a poder encolher até
sumir.

---

#### A caixa e os painéis de ficha (chat 1)

**A caixa do Transformar gira com o objeto.** Com um desenho escolhido ela usava
os eixos da TELA: o desenho virava e a caixa ficava reta. Agora ela é medida nos
eixos do próprio objeto, e "canto" volta a querer dizer os dois eixos do
Escalar, e "meio de lado", um só.

**A bolinha de girar mede-se pelo comprimento do osso** — três quartos dele,
perto da ponta, com um mínimo de 30 px de tela para o osso curto não perder a
bolinha. Ela nascia a 60 px fixos do pivô, colada na bolinha vermelha.

**Três alças no osso: `n`, `s` e `e`.** As duas dos lados são a espessura; a da
ponta é o comprimento. Os quatro cantos saíram porque canto não quer dizer nada
numa linha. E **`w` saiu por uma razão que só apareceu na conta**: `w` é sempre
o ponto (0,0) da caixa — a base do osso na linha de centro —, ou seja, **é
sempre o mesmo ponto que o pivô**, qualquer que seja a espessura. O quadradinho
ficava eternamente em cima do ponto vermelho, e era isso que o Humberto estava
vendo empilhado. Com desenho escolhido continuam os oito.

**Os painéis de ficha encolheram.** Propriedades: **591 → 205 px** de sobra.
Exibição: **653 → 132**. E saiu uma caixa **"Travar" duplicada**, que dizia duas
vezes a mesma coisa no mesmo painel.

---

#### A malha (chat 4)

**Gerar malha não move mais o desenho.** O defeito era antigo, do lote 63a, e
era o mais grave da rodada: gerar a malha deslocava a arte de lugar. Agora o
canvas inteiro é mapeado na caixa que a malha já ocupa, e a arte fica onde
estava.

**O "parou de funcionar" era um nome trocado e um `import` faltando** — não era
a função, era a ligação.

**A aba Malha liga a ferramenta sozinha**, em Montagem, e avisa no rodapé: abrir
a aba e nada responder era o silêncio que o Humberto tinha encontrado.

**O painel voltou a ter nome curto nos botões**, com quatro textos guardados
para a dica. Ícone sozinho não se lê; nome comprido vira parede. O meio-termo é
nome curto no botão e a frase inteira na dica.

---

Testes: **2.708 → 2.752** (2.723 passam, 29 pulados: o manual pausado).
`tsc` limpo · conformidade 53 de 53 · roteiro 14 de 14 · medições: 22 de 22 de
lado, **14 de 22 de altura** — as que faltam estão nomeadas no `ESTADO.md`, com
os números e o dono.

### v12.1 — O gesto do P: ele mostra quem já é filho, troca pai com filho, e a seta anda direito — 13/09/2026

Um chat só, o plano `documentos/planos/PLANO o gesto do P 2026-09-13.md`. Três
itens, todos do Humberto, no mesmo dia.

**O `P` mostra quem já é filho (P1).** Ele: *"quando eu seleciono um osso e
aperto P, os ossos deviam mostrar quem é filho desse osso; o Spriter faz isso
com cor e opacidade leve, aí eu posso clicar para transformar em filho ou
desafilhar."* Até aqui o `P` afilhava às cegas: não dava para ver o que já
estava preso. Agora, com a tecla segurada, **os filhos de agora ficam pintados
de verde, com opacidade leve** — o osso filho leva um traço por cima, o desenho
filho leva o contorno. E o clique passa a ser um interruptor de verdade: clicar
em quem **já era filho** o **desafilha**, e ele fica solto na raiz. Antes, esse
clique só dizia *"já é filho"* e não fazia nada.

**O `P` troca pai e filho (P2).** O arrasto da Árvore já trocava desde a v12.0;
o `P` ainda perguntava ao `canReparent` e parava antes da porta única. Os dois
gestos agora dão no mesmo lugar: com um osso escolhido, clicar num **ancestral**
dele troca os dois de lugar, num passo de desfazer só. Quem decide continua
sendo o `reparentVerdict`, e quem faz é o `SwapBones` — um caminho só, como
manda o lote 34.

**A seta do teclado não bagunça mais a seleção (P3).** O mesmo defeito que o
arrasto tinha (item 2.1 da v12.0), na seta: cada osso escolhido recebia o
deslocamento, e com **pai e filho na mesma seleção o filho andava duas vezes**.
Agora anda só quem não tem ancestral dentro da própria seleção — a mesma conta
do arrasto. Para isso ela subiu de `viewport/tools/translate.ts` para
`doc/bones.ts` (`topLevelBones`), que é onde mora "quem é pai de quem": a seta
vive em `tools/select.ts`, que é quem o `translate.ts` importa, e pedir de volta
faria um círculo. Quem já importava `topLevelBones` do `translate.ts` continua
importando.

### v12.0 — A caixa, as ferramentas, o parentesco e a malha: quatro chats numa rodada — 13/09/2026

Os quatro chats do plano `documentos/planos/PLANO caixa ossos e malha 2026-09-13.md`,
fechados juntos. A régua de tudo: *"eu não quero fazer um Spine, eu quero um
Spriter com as ferramentas do Spine."*

> A **v11.9** foi um fecho sujo — o `versao.py` rodou enquanto dois chats ainda
> escreviam, e o zip saiu com 4 testes vermelhos. **O conteúdo dela entrou
> aqui**, com a árvore parada e a suíte inteira verde. Use este zip, não aquele.

---

#### A caixa (chat 1)

**A caixa acompanha o objeto.** Com um desenho escolhido a caixa usava os eixos
da TELA: o desenho girava e a caixa ficava reta. O Humberto: *"um sprite, quando
vira, a caixa não está virando junto"*. Agora ela é medida nos eixos do próprio
desenho — o ângulo do osso mais a rotação do anexo. Osso e desenho passam a
seguir a mesma regra, que era o que confundia.

**A bolinha de girar foi para a metade de cima do osso**, do lado da ponta. Ela
nascia a 60 px do pivô, colada na bolinha vermelha, e as duas se atrapalhavam.
Agora mora a três quartos do comprimento do osso, com um mínimo em pixels de
tela para o osso curto não perder a bolinha. Longe do pivô, o giro ganha
alavanca e os dois pontos não se confundem.

**Três quadradinhos no osso, não oito.** Com um osso escolhido ficam `w`, `e`
(a espessura) e `n` (o comprimento, puxando pela ponta). Saem os quatro cantos
— canto não quer dizer nada numa linha — e o `s`, que puxaria pela base, onde
já está o pivô. **Com um desenho continuam os oito.** E o que não está na tela
não responde ao toque: `transformHit` não devolve mais um nome que ninguém vê.

---

#### As ferramentas (chat 2)

**Mover vários não bagunça mais.** O Humberto: *"seleciono vários objetos e eles
viram bagunça quando movo"*. Um osso filho já anda junto com o pai, porque a
pose dele é relativa ao pai — escrever o mesmo deslocamento nos dois fazia o
filho andar **duas vezes**, e a seleção se desmanchava. Agora, com pai e filho
na mesma seleção, só o **pai** recebe a conta. Vale para **Mover, Girar,
Escalar e Inclinar**: os quatro escrevem valores locais, e todo valor local já
é herdado pelos filhos. Quem não é parente continua andando — o filtro tira só
quem tem ancestral dentro da própria seleção.

**O Transformar é o primeiro botão da barra.** Ele já era a ferramenta que abre
o programa, mas nascia no segundo botão, e o primeiro botão é onde o olho
procura a ferramenta principal. Selecionar passou para o segundo. A ordem das
teclas em `ui/keys.ts` acompanhou — duas linhas trocadas de lugar, nenhuma
tecla mudou de ferramenta: o `T` continua no Transformar e o `Q` no Selecionar.

**O Inclinar entrou no Transformar.** `Alt` + arrastar o **meio de um lado** da
caixa inclina, em vez de escalar. Nenhuma alça nova, nenhuma alça a mais na
tela: quem nunca apertar o `Alt` não vê diferença.

| Alça | Sem `Alt` | Com `Alt` |
|:---|:---|:---|
| meio de cima / de baixo | escala Y | **inclina X** — o topo anda, a base fica |
| meio dos lados | escala X | **inclina Y** |
| os quatro cantos | escala os dois | escala os dois: **canto não inclina** |

Sem osso escolhido o `Alt` não faz nada: um anexo não tem inclinação própria no
formato (§7), e inventar uma criaria um campo que nenhum leitor entende. A
tecla está escrita na dica do botão, porque tecla que ninguém vê precisa estar
em algum lugar que se lê sem abrir o código.

Por que este gesto: o **Spriter** e o **DragonBones** não têm inclinar nenhum, e
o **Spine** tem, mas como ferramenta separada, com alças próprias. Nenhum dos
três resolve dentro de uma caixa só — então veio o gesto que todo editor de
desenho tem há trinta anos. Está nos "Desvios" do plano.

**Mover, Girar, Escalar e Inclinar continuam na barra**, para quem quer uma de
cada vez. O que muda é que ninguém precisa delas.

---

#### Criar e parentesco (chat 3)

**Clicar numa imagem na cena não conta mais como escolher osso.** O Humberto:
*"quando crio objetos, as coisas ficam se enganchando; vira parente de coisa que
não estava selecionada"*. Era daí que vinha: o osso novo perguntava "qual osso
está escolhido?" e uma imagem clicada respondia por um. Agora não responde mais,
e o osso novo deixa de enganchar em coisa que ninguém escolheu. Vale igual para
o **Ponto** e a **Caixa**. A cadeia osso-atrás-de-osso continua como era: com um
osso escolhido com a mão, o novo nasce filho dele.

Uma coisa que **não** mudou, e não podia mudar: o formato exige exatamente um
osso sem pai (§4.2). "Solto", no Recorte, quer dizer pendurado na raiz — não
existe osso sem pai nenhum.

**O filho pode virar pai do pai.** `canReparent` recusava, porque seria um ciclo
— e recusar é o certo para o arquivo. O que faltava era o gesto: agora os dois
**trocam de lugar**, o pai vira filho, e a cadeia continua de pé, num passo de
desfazer só. Por enquanto só **arrastando na Árvore**; o mesmo gesto pela tecla
fica para o lote seguinte.

---

#### A malha (chat 4)

**"Ligar" fazia três trabalhos com o mesmo nome, no mesmo painel.** Agora cada
coisa tem um nome que diz o que é: **Usar a forma de outra malha** · **Criar
aresta** / **Apagar aresta** (a aresta é o que manda onde a malha dobra) ·
**Ligar ossos**. E "Suavizar" virou **Suavizar tudo**, que é o que ele faz.

**A aba Malha e pesos deixou de ser uma parede de texto.** Os botões nasceram de
novo em **ícone, com o nome na dica**, que é a regra da casa, e as frases de
ajuda soltas saíram do meio do painel.

**O contorno gerado nasce 2 px afastado da arte.** `traceOutline` andava em cima
do primeiro pixel opaco e a malha comia a borda do desenho. O número fica
visível para quem quiser mudar.

**Modo "Criar vértice".** O clique simples cria o vértice, como no Spine e no
DragonBones. Antes era só `Ctrl` + clique no vazio, que ninguém descobria.

---

Testes: **2.666 → 2.708** (2.679 passam, 29 pulados: o manual pausado).
`tsc` limpo · conformidade 53 de 53 · roteiro 14 de 14 · medições 22 de 22.

### v11.9 — Uma ferramenta só: o Transformar na frente, o Inclinar dentro, e mover vários sem bagunça — 13/09/2026

> **Fecho sujo: não use o zip da v11.9.** O `versao.py` rodou enquanto o chat 1
> e o chat 4 ainda escreviam, e o zip e o `programa/` saíram com a árvore no
> meio do trabalho deles — 4 testes vermelhos, nenhum deste lote. O que está
> escrito abaixo é o que este lote fez, e está certo; ele **entra de novo num
> fecho limpo, em versão nova**, com a árvore parada. Ordem do planejador.

Chat 2 do plano `documentos/planos/PLANO caixa ossos e malha 2026-09-13.md`,
itens 2.1 a 2.4. A régua: *"eu não quero fazer um Spine, eu quero um Spriter
com as ferramentas do Spine."*

**Mover vários não bagunça mais (item 2.1).** O Humberto: *"seleciono vários
objetos e eles viram bagunça quando movo"*. Um osso filho já anda junto com o
pai, porque a pose dele é relativa ao pai — escrever o mesmo deslocamento nos
dois fazia o filho andar **duas vezes**, e a seleção se desmanchava. Agora,
com pai e filho na mesma seleção, só o **pai** recebe a conta. Vale para
**Mover, Girar, Escalar e Inclinar**: os quatro escrevem valores locais, e todo
valor local já é herdado pelos filhos. Quem não é parente continua andando: o
filtro tira só quem tem ancestral dentro da própria seleção.

**O Transformar é o primeiro botão da barra (item 2.2).** Ele já era a
ferramenta que abre o programa, mas nascia no segundo botão. O primeiro botão
é onde o olho procura a ferramenta principal. Selecionar passou para o segundo.

**A ordem das teclas acompanhou a da barra.** `ui/keys.ts` é arquivo de
passagem, e o `TOOL_KEYS` guarda a ordem em que Ajuda → Atalhos lista as
ferramentas; o teste `teclas` compara as duas. Foram **duas linhas trocadas de
lugar**, e nenhuma tecla mudou de ferramenta — o `T` continua no Transformar e
o `Q` no Selecionar. Fica dito aqui porque o arquivo é de todos.

**O Inclinar entrou no Transformar (item 2.3).** `Alt` + arrastar o **meio de
um lado** da caixa inclina, em vez de escalar. Nenhuma alça nova, nenhuma alça
a mais na tela: quem nunca apertar o `Alt` não vê diferença.

| Alça | Sem `Alt` | Com `Alt` |
|:---|:---|:---|
| meio de cima / de baixo | escala Y | **inclina X** — o topo anda, a base fica |
| meio dos lados | escala X | **inclina Y** |
| os quatro cantos | escala os dois | escala os dois: **canto não inclina** |

Sem osso escolhido o `Alt` não faz nada: um anexo não tem inclinação própria no
formato (§7), e inventar uma criaria um campo que nenhum leitor entende. A
tecla está escrita na dica do botão, porque tecla que ninguém vê precisa estar
em algum lugar que se lê sem abrir o código.

Por que este gesto, e não outro: o **Spriter** e o **DragonBones** não têm
inclinar nenhum, e o **Spine** tem, mas como ferramenta separada, com alças
próprias. Nenhum dos três resolve dentro de uma caixa só — então veio o gesto
que todo editor de desenho tem há trinta anos. Está escrito nos "Desvios" do
plano.

**Mover, Girar, Escalar e Inclinar continuam na barra (item 2.4)**, para quem
quer uma de cada vez. O que muda é que ninguém precisa delas.

Testes: **2.666 → 2.684**, 18 novos em `editor/testes/ferramentas.test.ts`.
`tsc` limpo · conformidade 53 de 53 · roteiro 14 de 14 · medições 22 de 22.

### v11.8 — Os desenhos vazios: uma vassoura, e a porta que fazia lixo fechada — 13/09/2026

O Humberto, 13/09/2026, querendo entender o slot antes de decidir sobre ele:
*"eu imagino que eu vou criar imagem, tirar imagens, e vai acabar tendo muitos
slots soltos. Porque eu não sei como é que eu vou administrar eles."*

Ele decidiu no fim da conversa: **o slot fica.** É o que faz as peles, a malha,
os pesos e a deformação funcionarem, e é por ele que o jogo troca a arma pelo
nome. O que saiu foi o acúmulo.

- **`Esqueleto → Novo → Slot` saiu**, no menu e no botão Novo da Árvore. Era a
  única porta do programa que criava um slot **vazio** — um gancho preso no
  osso que não mostra nada — sem ninguém pedir. Em todo o resto, o slot nasce
  junto com o desenho e morre junto com ele: clicar no desenho, na cena ou na
  Árvore, escolhe os dois, e `Delete` leva os dois. A porta certa continua ali,
  logo abaixo: **Imagem no slot…**.
- **`Esqueleto → Limpar desenhos vazios`**, novo. Acha todo slot que pele
  nenhuma veste, diz quantos apagou e leva junto o que fica órfão — as
  timelines de slot, de deform e de sequência, e as entradas de ordem de
  desenho. Um passo de desfazer para todos. Cinza quando não há nenhum.
- **Três coisas que parecem vazio e não são**, e a vassoura não toca nelas:
  o slot com um ponto, uma caixa ou uma máscara dentro (são anexos); o slot
  vestido só numa das peles (é o trabalho das peles); e o slot que uma máscara,
  uma regra de caminho ou um morph cita pelo nome — ali o slot vazio é um
  marco. Anexo `null` é a pele que **esconde**, e esconder não é vestir: esse
  conta como vazio.

Nada mudou no formato `.bone`: 53 de 53 na conformidade, e os dois runtimes
intactos.

### v11.7 — Conserto: o Ligar só funcionava com a ferramenta Pesos na mão — 12/09/2026

O Humberto, 12/09/2026, testando a v11.6: *"eu vi onde estava a corrente;
quando clica nela e no osso, não funciona"*. Estava certo.

- **O modo Ligar agora é um modo de verdade.** O clique no osso liga ele à
  malha **com qualquer ferramenta na mão**. Na v11.6 só a ferramenta Pesos
  atendia, e o programa abre com o Transformar: quem apertava Ligar e clicava
  no osso só trocava a seleção — e derrubava a malha junto. Quem atende agora é
  a cena, antes da ferramenta, como o Bind do Spine.
- Com o modo aberto, o clique **fora de osso nenhum não faz nada**: um modo faz
  uma coisa só, e deixar o clique passar derrubaria a malha.
- A prova `npm run pesos` passou a rodar o caminho **como ele é de verdade**:
  ferramenta de abertura na mão, sem trocar nada, um osso pela cena e outro
  pela Árvore. 14 passos.

### v11.6 — Uma imagem em dois ossos: o modo Ligar, a cor por osso e a pizza — 12/09/2026

Lote 69, plano "pesos — uma imagem em dois ossos". O Humberto, 12/09/2026:
*"não consigo usar peso de forma decente. Pega uma imagem e liga a dois ossos.
O sistema não está completo"*. O modelo é o do Spine e o do DragonBones.

- **Botão Ligar** na aba Malha e pesos (ícone de corrente, nome na dica). Ele
  abre um modo: enquanto está aberto, cada clique num osso — **na cena ou na
  Árvore** — liga ele à malha, e o clique num osso da lista tira. Ligar de novo,
  ou Esc, termina. Em Animando fica cinza.
- **Cada osso ligado tem uma cor**: a do arquivo, ou uma da paleta pelo índice.
  A cor aparece na bolinha da lista e na cena.
- **Cada vértice virou uma pizza**, uma fatia por osso, do tamanho do peso. A
  escala azul–vermelho saiu: ela mostrava um osso por vez, e por isso uma
  imagem presa a dois ossos era impossível de ler.
- **A malha não sai mais da seleção.** Com Malha (M) ou Pesos (G) na mão,
  escolher o osso a pintar — na Árvore ou clicando no osso na cena — troca só o
  osso; o desenho fica, e a aba continua na malha.
- **O P segurado numa malha saiu.** Ele ligava osso à malha desde o lote 63;
  nenhum dos três programas tem esse gesto. O P volta a fazer uma coisa só:
  prender filhos.
- A aba **ouve a troca de ferramenta**: a linha "Escolha a ferramenta Malha (M)
  ou Pesos (G)" some na hora, e não na próxima mudança do documento.
- O **raio do pincel** nasce com um quarto do maior lado da malha (mínimo 4), e
  não mais 40 para toda peça. Assim que o raio é escolhido a mão, a oferta cala.
- Prova nova, no navegador de verdade: `npm run pesos` — 13 passos, do abrir ao
  Pesos automáticos, com os dois ossos ligados por clique.

### v11.5 — Documentos: as regras de vários chats entraram no CLAUDE.md — 11/09/2026

- O `CLAUDE.md` do projeto ganhou as regras 13 a 18, o `documentos/PARTES.md`
  na lista de leitura e os comandos `npm run roteiro` e `npm run medir`
  (escrito pelo planejador, por ordem do Humberto). Saiu de `PARTES.md` a
  proposta que esperava por isso, e do `ESTADO.md` a frase que dizia que ela
  esperava. Nenhum código mudou.

### v11.4 — Arrumado: as sobras de código morto — 11/09/2026

Lote A9, pedido do planejador. **Nada muda para quem usa o programa.**

- Saiu código que ninguém chamava: a opção `showWarnings` de `importPsd`, o
  `newRuleControl` e o `criar` da Árvore, o `compensationBoxes` e o
  `viewButton` da cena, o `snapshot`, o `restore`, o `cloneJson` e o tipo
  `StructureSnapshot` de `tree-commands.ts`, e dois nomes importados sem uso.

### v11.3 — Arrumado: o que todo lote escreve, as provas e o mapa das partes — 11/09/2026

Lotes A7 e A8, plano arrumação. **Nada muda para quem usa o programa.**

- O `ESTADO.md` ficou só com o hoje (34 linhas). A história foi para
  `documentos/HISTORICO.md`, sem mudar uma letra.
- Aqui, cada versão tem um subtítulo `### vN.N — o que mudou — data`, a mais
  nova em cima. O `backup/INDICE.md` ganhou no topo um índice por dia.
- Os scripts de prova foram para `ferramentas/provas/`: `npm run roteiro`, e o
  novo `npm run medir`.
- `documentos/PARTES.md`: o mapa das partes do programa, um chat por parte, os
  arquivos de passagem e as seis regras para vários chats.

### v11.2 — Arrumado: um CSS por painel — 11/09/2026

Lote A6, plano arrumação. **Nada muda para quem usa o programa.**

- `panels/panels.css` tinha 2.105 linhas com o estilo de dez painéis. Agora
  cada painel tem o seu: `tree.css`, `properties.css`, `animations.css`,
  `draw-order.css`, `skins.css`, `palette.css`, `rules.css`, `history.css` e
  `quick-sheet.css`. O `panels.css` (305) ficou com o que é de todos.
- Nenhum seletor mudou. A ordem de carga foi escolhida para nenhuma regra
  trocar de vencedora, e as 22 fotos dos painéis (11 abas, em 1440×900 e
  1280×720) saem iguais, byte a byte, às de antes.

### v11.1 — Arrumado: o modelo da Árvore em quatro arquivos — 11/09/2026

Lote A5d, plano arrumação. **Nada muda para quem usa o programa.**

- `panels/tree-model.ts` tinha 1.609 linhas. Agora ele é a porta de três:
  `tree-rows.ts` (as linhas da Árvore, a busca, a dobra, o arrasto — 460),
  `tree-commands.ts` (criar e apagar — 767) e `rename.ts` (renomear em todo
  lugar, e o Substituir nomes — 304). O `tree-model.ts` (85) exporta tudo o
  que eles exportam: nenhum `import` de fora mudou.
- Com isto fecha o A5: a casca, a linha do tempo, a cena e o modelo da Árvore
  em pedaços.

### v11.0 — Arrumado: a cena em três arquivos — 11/09/2026

Lote A5c, plano arrumação. **Nada muda para quem usa o programa.**

- `viewport/viewport.ts` tinha 2.527 linhas no começo do plano (2.411 depois
  do A4, quando a ferramenta na mão foi para `viewport/tools/registry.ts`).
  Agora são três: `viewport.ts` (o painel, a câmera, o canto do zoom, os
  eventos de ponteiro e de teclado — 1.646), `viewport-toolbar.ts` (a barra de
  cima, o modo, os botões — 401) e `viewport-draw.ts` (o desenho da cena —
  721).

### v10.9 — Arrumado: a linha do tempo em quatro arquivos — 11/09/2026

Lote A5b, plano arrumação. **Nada muda para quem usa o programa.**

- `panels/dopesheet.ts` tinha 2.780 linhas. Agora são quatro: `dopesheet.ts`
  (o painel, montagem, desenho, andar no tempo, escolher chaves, teclado —
  1.655), `dopesheet-player.ts` (as barras: tocador, régua, Resumo, o corpo da
  folha — 992), `dopesheet-edit.ts` (os botões que escrevem — 519) e
  `dopesheet-pointer.ts` (o ponteiro — 155).
- Saíram 98 importações que não eram usadas, nos arquivos da linha do tempo e
  da casca.

### v10.8 — Arrumado: a casca em quatro arquivos — 11/09/2026

Lote A5a, plano arrumação. **Nada muda para quem usa o programa.**

- `ui/shell.ts` tinha 2.864 linhas. Agora são quatro: `shell.ts` (montagem,
  menus, colunas, faixa de baixo, teclado — 2.063), `shell-file.ts` (os
  comandos de arquivo — 570), `shell-actions.ts` (as ações da casca — 440) e
  `shell-drop.ts` (soltar arquivo na janela e o rascunho — 260).
- Mudar um comando de arquivo é abrir `shell-file.ts`, sem ler o resto.

### v10.7 — Arrumado: quem pode importar quem — 11/09/2026

Lote A4, plano arrumação. **Nada muda para quem usa o programa.**

- A regra, em cinco degraus, está no cabeçalho de `editor/src/contract.ts`, e
  o teste `fronteiras` confere arquivo por arquivo: a base (documento, tempo,
  malha) não conhece a interface; o `io/` não abre janela; o painel da cena só
  o `main.ts` monta; ninguém importa a casca.
- Saíram as 12 importações contra a direção. A conta de mundo e local foi para
  `doc/world-math.ts`; quem é pai de quem, para `doc/bones.ts`; achar uma
  animação, para `anim/animations.ts`; achar um desenho, para
  `doc/attachments.ts`; a ferramenta na mão, para `viewport/tools/registry.ts`.
  Os arquivos de antes continuam exportando os mesmos nomes.
- O `el` (criar um elemento da tela) existe uma vez só, em `ui/dom.ts`. Eram
  seis cópias.

### v10.6 — Arrumado: os testes do editor por assunto — 11/09/2026

Lote A3, plano arrumação. **Nada muda para quem usa o programa.**

- Os 88 arquivos de teste do editor, 66 com o número do lote no nome, viraram
  **37 arquivos por assunto**: `arvore`, `ordem`, `malha`, `pivo`,
  `pasta-do-projeto`, `grade-de-imagens`, `animando`, `linha-do-tempo`,
  `tocador`, `inclinar`, `cena`, `cena-selecao`, `ferramentas`, `menus`,
  `paineis`, `colunas-e-barra`, `tema-e-ficha`, `peles`, `regras`, `arquivo`,
  `acabamento`, `exportar-e-importar`, `ajuda`, `varios`, e os que já tinham
  nome de assunto (`chaves`, `curvas`, `viewport`, `teclas`, `acoes`…).
- Os mesmos 2.626 testes. Cada arquivo antigo virou um bloco com o nome dele.
- Mexeu na Árvore? `npx vitest run editor/testes/arvore.test.ts`.

### v10.5 — Arrumado: toda ação de menu com dono — 11/09/2026

Lote A2, plano arrumação. **Nada muda para quem usa o programa.**

- Nasceu `editor/src/ui/actions-table.ts`: os 174 itens dos sete menus, cada
  um com quem faz e quando ele existe (desde a partida, na casca, ou com o
  painel montado).
- 22 ações passam a existir **desde a partida, sem precisar de aba nenhuma**:
  criar osso, slot, ponto, caixa, máscara, evento e parâmetro; apagar e
  duplicar; frente, trás, frente e fundo de tudo, tirar da pasta e copiar a
  ordem na animação; nova animação e Montagem ⇄ Animando; nova pele; copiar a
  pose e colar em todas as chaves.
- Cada parte guarda as dela num arquivo `*-actions.ts` ao lado do painel. Os
  botões dos painéis chamam as mesmas funções do menu.

### v10.4 — Arrumado: toda tecla numa tabela só — 11/09/2026

Lote A1, plano arrumação. O Humberto: *"as teclas deveriam estar em um lugar
para conferir de forma rápida, e não espalhadas no código"*. **Nada muda para
quem usa o programa.**

- Nasceu `editor/src/ui/keys.ts`: cada tecla, onde ela vale (toda parte, cena,
  linha do tempo, Árvore, Ordem), o que faz e em que condição. Uma linha por
  tecla.
- A casca, a cena, a linha do tempo, a aba Ordem e a Árvore perguntam a tecla
  a essa tabela. O cheque de "está num campo de texto" é um só (`isTyping`).
- Duas linhas com a mesma tecla, no mesmo lugar, fazendo coisas diferentes, sem
  condição que as separe: o teste `teclas` fica vermelho.
- Ajuda → Atalhos sai da mesma tabela, com as mesmas linhas de antes.

### v10.3 — Mudado: a ordem de desenho como o Z-Order do Spriter — 11/09/2026

Lote 66, plano ordem. O Humberto: *"ORDEM: olha o manual do Spriter."*

- **Na cena**, com um desenho escolhido: **Ctrl+↑** e **Ctrl+↓** sobem e descem
  uma casa; **Ctrl+→** e **Ctrl+←** mandam para a frente e para o fundo de tudo.
  Na aba Ordem também. Num campo de texto, as setas continuam do campo.
- **Em Animando**, mudar a ordem grava uma **chave de ordem** no tempo de agora,
  e só vale daquela chave em diante. Com Gravar sozinho desligado, recusa e diz
  por quê. A primeira chave de ordem depois do 0 guarda junto a ordem de antes.
- A aba Ordem, em Animando, mostra a ordem **do quadro de agora**. A linha que
  uma chave tirou do lugar ganha um losango ◆.
- **Editar → Copiar a ordem na animação**: a ordem de agora vira a única chave
  de ordem da animação, em 0.
- Ajuda → Atalhos lista as quatro teclas.

### v10.2 — Mudado: a Árvore é uma árvore só, como a Hierarchy do Spriter — 11/09/2026

Lote 64, plano árvore. O Humberto, com a foto da Árvore: *"são três listas que
não dizem nada: que osso manda em qual peça?"*.

- A Árvore deixou de ter três seções (Ossos, Slots, Desenhos). É **uma árvore
  só**: cada osso tem por baixo, primeiro, os desenhos dele e, depois, os ossos
  filhos. Desenho solto fica no nível 0, depois dos ossos.
- Uma linha por slot, com a miniatura do desenho **da pele em edição**. Ponto,
  caixa, máscara e malha mostram o ícone do tipo. Slot sem desenho nesta pele
  fica em cinza.
- Cada osso com gente embaixo tem o triângulo de dobrar. A dobra fica no
  navegador, por arquivo.
- A busca abre a árvore até cada acerto.
- Arrastar para cima de um osso vira filho dele, sem mover. Arrastar para o
  **vazio do fim** deixa solto.
- **P segurado + clique numa linha** vira filho do osso escolhido, igual à cena.
- Saíram da Árvore: as contagens e a bolinha ●/○ de cada desenho. Trocar o
  desenho do slot é o campo Anexo das Propriedades, ou o botão direito na cena.

### v10.1 — Mudado: painéis que cabem na coluna — 11/09/2026

Lote 65, plano "painéis que cabem". O Humberto, com a foto da aba Malha e
pesos: *"esses menus estão impossíveis de usar"*.

- Nenhum painel das colunas é mais largo que a coluna, e nenhum rola de lado.
  Texto quebra linha, nome comprido corta com reticências e aparece inteiro na
  dica, campos e listas cabem na largura, linhas de botões quebram em duas.
- A aba **Malha e pesos** começa pelo de todo dia: Desenho escolhido · Forma
  (com o Virar malha) · Ossos que influenciam · Pesos · Pincel. A **malha
  ligada** foi para o fim, dobrada, como "Avançado".
- Medido num Chrome sem janela, em 1440×900 e 1280×720: as 11 abas cabem nos
  dois tamanhos (`medir-paineis.mjs`).

### v10.0 — Mudado: o botão direito troca a imagem; o transparente deixa o clique passar — 11/09/2026

Lote 60c. Dois recados do Humberto, com fotos.

- **Clique esquerdo só escolhe.** A grade de imagens não aparece mais sozinha.
- **Botão direito num desenho** abre ali a grade das imagens da mesma pasta,
  como segurar o botão direito no Spriter. Embaixo: fonte pasta ou objeto, e
  as opções *Em todas as peles*, *Trazer para a frente*, *Mandar para trás*,
  *Duplicar* e *Apagar*, cada uma só para o desenho. Trocar a imagem, clicar
  fora ou Esc fecham a grade.
- *Definir pivô…* saiu do botão direito: fica na aba Imagens. Saiu também
  Exibição → Grade de imagens.
- **O clique passa pela parte transparente da imagem**, como no Spriter: pega
  o que estiver embaixo, ou nada. Vale também no miolo da caixa do Transformar.

### v9.9 — Mudado: os consertos da rodada 1 do roteiro — 11/09/2026

Lote 68. O `npm run roteiro` deu 9 de 14, e o planejador decidiu três
consertos. Depois deles, o roteiro dá **13 de 14**: só falta a Árvore (lote 64).

- **O programa abre vazio**, em Montagem, com o Transformar na mão, como o
  Spriter abre um projeto novo. As boas-vindas dizem *Arquivo → Abrir pasta… e
  arraste as peças*. O herói fica em Arquivo → Abrir o herói (exemplo) e nas
  boas-vindas, e abre em Montagem.
- **O começo da animação se guarda sozinho**: com o Gravar ligado, a primeira
  chave de uma propriedade num tempo depois de 0 grava junto a chave em 0, com
  o valor de montagem. Um passo de desfazer para as duas.
- **Espaço toca e pausa em toda parte**, também com o foco na cena. Segurar
  Espaço e arrastar continua movendo a vista. Ajuda → Atalhos lista os dois.

### v9.8 — Novo: o Roteiro dos 30 minutos roda sozinho — 11/09/2026

Lote 67. O Roteiro dos 30 minutos é o critério de pronto do programa: montar
um boneco como no Spriter, do Abrir pasta ao reabrir.

- `npm run roteiro` sobe o editor e um Chrome sem janela, faz os 14 passos com
  clique, arrasto e tecla de verdade, e diz passo a passo **passou** ou o que
  faltou. `--fotos PASTA` tira uma foto por passo.
- A pasta do passo 2 é de mentira, em memória: roda o Abrir pasta de verdade,
  com as subpastas. O Salvar grava nela, e o passo 14 reabre a pasta e compara
  o `.bone` por texto.
- Primeira rodada: 9 de 14. O que faltou está na tabela do Roteiro.

### v9.7 — Mudado: a grade de imagens, como o Spriter — 11/09/2026

Lote 60b, plano consertos do teste. O Humberto, sobre a lista do lote 60: *"o
seu é um menu dos satanás"*; e *"a nossa pode ser em grade"*.

- Com um desenho escolhido, aparece **na cena, embaixo dele**, uma grade de
  miniaturas: até 6 por linha, a atual com contorno laranja, o nome na dica.
  O clique troca a imagem, que cai pelo pivô; `Shift` troca em todas as peles;
  em Animando com Gravar, vira chave de Desenho.
- Embaixo da grade, **fonte: pasta | objeto**: as imagens da mesma subpasta,
  ou só as que este slot já usou (nas peles e nas chaves de Desenho). A
  escolha fica no navegador.
- A grade acompanha o zoom e o pan, some durante o arrasto e volta ao soltar.
  Se não cabe embaixo, vai para cima. Setas andam, Enter troca, Esc esconde.
- Exibição → **Grade de imagens** liga e desliga.
- O clique de novo no desenho escolhido não abre mais a lista com busca. Ela
  continua no campo Imagem, na Ficha rápida e no botão direito do desenho.

### v9.6 — Mudado: o P é um gesto só; prender não move — 11/09/2026

Lote 63a. Três recados do Humberto.

- **O P é um gesto só**: escolha um osso, segure P, clique em quem vira filho
  dele. Saíram o modo "escolha os filhos, P, clique no pai" e a janela *Virar
  filho de qual osso?*. Com outra seleção, o P só diz no rodapé: *Escolha um
  osso. Depois segure P e clique em quem vira filho dele*. O item Esqueleto →
  Virar filho de… diz a mesma frase.
- **Prender em Animando não move mais**: prender só desenhos fica em Animando,
  e o desenho fica onde está no quadro que se vê. Antes o programa voltava para
  a Montagem, e a cena inteira pulava para a pose de repouso.
- **Árvore**: soltar um slot ou um desenho em cima de um osso troca o pai, sem
  mover. Antes só osso sobre osso.
- A raiz some das listas das regras (cadeia, Alvo, osso da física).
- **Virar malha não foge**: a malha nasce com os mesmos quatro cantos da
  imagem, pelo recorte do atlas, mesmo sem largura e altura no desenho. Em
  Animando, os botões da aba Malha e pesos que gravam a forma ou os pesos ficam
  cinza, com a dica *Volte à Montagem (Ctrl+Tab)*.

### v9.5 — Novo: o P liga o osso à malha — 10/09/2026

Lote 63, plano "malha — o P liga o osso". O Humberto: *"como faz para associar
um osso à malha?"*

- Osso escolhido, **P** segurado, clique numa **malha**: o osso entra na lista
  **Ossos que influenciam**. Malha sem peso: ele recebe peso 1 em todos os
  pontos. Malha com peso: entra com 0, pronto para o pincel ou para Pesos
  automáticos.
- O mesmo clique num osso que já está na lista **tira**: o peso dele vai para
  os outros do ponto, com soma 1. Tirar o último devolve a malha sem pesos, no
  mesmo lugar.
- Cada linha da lista ganha o botão **tirar** (lixeira, nome na dica).
- **Pesos automáticos** usa só os ossos da lista. Lista vazia: todos, e a dica
  diz isso.
- P + clique numa imagem inteira continua trocando o pai.
- Peso 0 agora vai para o arquivo (a §7.4 aceita `0..1`): é assim que a lista
  guarda um osso ligado e ainda não pintado. Nenhum campo novo.

### v9.4 — Mudado: a raiz é invisível — 10/09/2026

Lote 60a do plano pasta do projeto. O Humberto, com duas imagens soltas
escolhidas: *"estão presas a um osso maldito, eu não fiz esse osso"*. Era a
raiz.

- A raiz é o mundo: **não se desenha** na cena (nem com Ver ossos, nem no
  fantasma) e **não pega** clique nem retângulo. Continua no arquivo, na origem.
- Clicar num desenho solto escolhe **só o desenho**. Antes escolhia a raiz
  junto, e Mover, Girar, Escalar e as setas mexiam no mundo inteiro.
- **Transformar com dois ou mais desenhos**: a caixa é o contorno deles, o pivô
  e a haste no **centro da caixa**. Girar e escalar mexem em cada desenho em
  volta do centro comum, como o Spriter; Mover e as setas levam todos. Um passo
  de desfazer por arrasto.
- **Árvore**: sem a linha `root`; os ossos de cima no nível 0; o slot solto diz
  *livre*. A raiz só aparece quando se mexe (valor fora do padrão, ou linha do
  tempo nela), com o nome *raiz* e a dica *o mundo*.
- **Propriedades** de um desenho solto: o campo Osso diz *nenhum (livre)*.

### v9.3 — Mudado: primeiro a arte, depois os ossos — 10/09/2026

Acréscimo ao lote 60 do plano pasta do projeto. Pedido do Humberto: montar como
no Spriter, a arte das peças para dentro, e depois os ossos.

- A imagem solta na cena nasce **sempre na raiz**, livre, e nunca mais presa ao
  osso escolhido. O rodapé diz que ela entrou solta.
- **Criar osso com desenhos escolhidos**: o osso novo nasce (sob o osso
  escolhido, ou na raiz) e **pega os desenhos sem movê-los** (o `Reparent` do
  lote 34). Um passo de desfazer para o osso e os desenhos. Rodapé: *Osso novo
  pegou 2 desenhos, sem mover*.
- O `Ctrl` do Criar osso, que prendia os desenhos (e os deixava pular), virou o
  contrário: **cria sem pegar**. A dica do botão e o rodapé dizem os dois.
- `P` + clique, o campo Osso e o arrasto na Árvore continuam prendendo depois,
  sem mover.
- 6 testes novos (`lote60b-primeiro-a-arte.test.ts`). 2.481 testes.

### v9.2 — Mudado: o Salvar empacota — 10/09/2026

Plano pasta do projeto, lote 62. Pedido do Humberto: ao salvar em `.bone`, o
programa empacota o atlas e o resto.

- **Salvar, Salvar como e Salvar como pacote** empacotam as imagens da pasta
  **em uso** — e só elas: 500 imagens na pasta e 40 no personagem salvam 40. O
  pivô vai junto, carimbado pelo rig. Uma função só decide (`atlasForSave`).
- O atlas (`heroi.atlas.json`) e a página (`heroi-atlas.png`) vão para **a
  pasta do projeto, ao lado do `.bone`**, pelo handle da pasta. A janela de
  salvar já abre na pasta. A página nunca tem o nome de uma imagem da pasta,
  e o atlas nunca pisa no atlas que veio com o arquivo.
- Sem jeito de gravar na pasta (aberta só para ler, ou o `.bone` salvo fora
  dela): baixa o atlas e as páginas, e o rodapé diz por quê.
- **Continuar de onde parou**: abrir a pasta de novo (pelo menu ou pelo
  recente) reabre o `.bone` salvo nela. Com a pasta aberta, as imagens voltam
  a vir da pasta, frescas; sem a pasta, o `.bone` abre pelo atlas, como sempre.
- **Saiu Esqueleto → Reempacotar atlas**: reempacotar é o Salvar.
- Nenhum campo novo no formato.
- 13 testes novos (`lote62-salvar-empacota.test.ts`). 2.475 testes.

### v9.1 — Mudado: o pivô por pasta — 10/09/2026

Plano pasta do projeto, lote 61. Pedido do Humberto: clicar no pivô de uma mão
e repetir para todas da mesma pasta.

- A janela **Definir pivô…** ganhou a caixa **Repetir para a pasta**, ligada
  por padrão quando a imagem está numa subpasta com outras. Mesmo tamanho,
  mesmo pixel; tamanho diferente, a mesma proporção. **Nada atravessa
  pastas**: o braço e a arma têm as suas. Na raiz a caixa fica desligada e
  diz por quê.
- Os desenhos que já usam imagens da pasta são **recolocados pelo pivô novo**,
  no mesmo passo de desfazer, e o rodapé diz quantos.
- **Definir pivô… vale para a imagem que ainda está só na pasta.** O pivô dela
  fica guardado no estado do editor (`RECORTE_editor_state.folderPivots`) e vai
  para a região quando ela entra na cena. Ao salvar, a lista fica só com as
  que ainda estão fora.
- Nenhum campo novo no formato.
- 10 testes novos (`lote61-pivo-por-pasta.test.ts`). 2.462 testes.

### v9.0 — Mudado: da aba para a cena, e trocar pela lista da pasta — 10/09/2026

Plano pasta do projeto, lote 60. Pedido do Humberto: trocar a imagem como no
Spriter, pelo botão esquerdo, vendo as da mesma pasta.

- **Arrastar uma imagem da pasta** para a cena, ou para um slot ou desenho da
  Árvore, funciona. Ela ganha uma **região provisória** (a página é a própria
  imagem): nada é empacotado, e o pivô e a troca pelo pivô valem igual. O slot
  leva o nome sem a subpasta (`mao_1`); o desenho guarda o caminho.
- **A lista da pasta**: miniaturas das imagens da **mesma subpasta**, a de agora
  marcada, busca, setas e `Enter`. Clique troca, **pelo pivô**; `Shift` troca
  em todas as peles; em Animando com Gravar ligado, vira chave de Desenho, só
  naquela animação. Abre pelo campo **Imagem** das Propriedades, pela linha
  **Imagem** da Ficha rápida, e pelo **clique parado no desenho já escolhido**,
  na cena. Arrastar continua movendo.
- **Botão direito no desenho, na cena**: Trocar por…, Trocar em todas as
  peles…, Definir pivô…. Fora de desenho, volta à ferramenta anterior, como
  antes.
- **Botão direito na aba Imagens**: Usar no desenho escolhido (cinza sem
  desenho, e a dica diz).
- **Um menu de botão direito só** (`ui/floating-menu.ts`) para a Árvore, a aba
  Imagens e a cena. Fecha no `Esc`, e agora segue o tema escuro.
- **Recarregar** atualiza na cena a imagem que mudou no disco.
- Nenhum campo novo no formato.
- 20 testes novos (`lote60-lista-da-pasta.test.ts`). 2.452 testes.

### v8.9 — Mudado: Abrir pasta; a aba Imagens mostra a pasta — 10/09/2026

Plano pasta do projeto, lote 59. Pedido do Humberto: começar como o Spriter.

- **Arquivo → Abrir pasta…**, logo depois de Abrir…, e também como primeiro
  botão das boas-vindas. Começa um documento vazio, e as imagens da pasta ficam
  na **aba Imagens, por subpasta** (as mãos numa, as cabeças noutra), em ordem
  natural: `01 (2)` antes de `01 (10)`. **Nada entra na cena sozinho.**
- A aba Imagens ganhou seções dobráveis (a dobra fica no navegador), o botão
  **Abrir pasta…** quando não há pasta e **Recarregar** quando há: imagem nova
  entra, apagada sai, a que está em uso fica marcada. A miniatura é lida só
  quando a linha aparece. O número de usos só aparece em imagem usada.
- A pasta entra em **Abrir recente**, com "(pasta)" no nome.
- **Saiu Importar → Imagens…** ("no Spriter não existe importar imagens") e a
  fila do importador. Era a fila que fazia 12 imagens de 580 px virarem
  7.000 px e a cena ir a 9%. Reproduzido antes de tirar: sem erro no console.
- **Soltar PNG na janela** põe as imagens na aba Imagens, e não na cena: nenhum
  slot, nenhum passo de desfazer, o arquivo não fica sujo.
- Nenhum campo novo no formato.
- 23 testes novos (`lote59-pasta-do-projeto.test.ts`). 2.432 testes.

### v8.8 — Mudado: a altura dos painéis fica guardada — 10/09/2026

Rodada 5, lote 52.

- A alça entre os dois grupos de painéis de cada coluna já se arrastava.
  Agora nenhum dos dois grupos fica com menos de **80 px**, **dois cliques**
  na alça devolvem a divisão de fábrica, e a divisão fica **guardada no
  navegador**, como o tema: sobrevive a recarregar e vale em qualquer arquivo
  aberto nesta máquina.
- As setas na alça param nela (tecla tratada uma vez).
- 7 testes novos (`lote52-altura-dos-paineis.test.ts`). 2.409 testes.

### v8.7 — Mudado: a sequência de PNG sai num .zip só — 10/09/2026

Rodada 5, lote 51.

- **Exportar imagem**, com **Sequência de PNG**, ganha a caixa **Um arquivo só
  (.zip)**, ligada por padrão: um download (`heroi.zip`, com os quadros na
  pasta `heroi/`), e o navegador não pede permissão para baixar doze
  arquivos. Desligada, um arquivo por quadro, como antes. `Ctrl+Shift+E`
  repete a escolha.
- O gravador do `.bonez` ganhou a porta do **ZIP comum** (`writeZip`, sem
  `mimetype` nem manifesto). O `.bonez` sai byte a byte igual; o caso ZIP-501
  continua passando.
- 5 testes novos (`lote51-sequencia-em-zip.test.ts`). 2.402 testes.

### v8.6 — Mudado: soltar entre duas linhas na aba Ordem — 10/09/2026

Rodada 5, lote 50.

- Na aba **Ordem**, cada linha tem três terços: o de cima e o de baixo
  **inserem** a peça entre duas linhas (uma linha laranja fina mostra onde),
  e o do meio faz o que sempre fez. Como no Spine e no Spriter.
- Vale para peça e para pasta inteira, que continua indo em bloco. Um passo
  de desfazer.
- 7 testes novos (`lote50-entre-linhas.test.ts`). 2.397 testes.

### v8.5 — Mudado: avisos com nome de gente, e o botão Ir para — 10/09/2026

Rodada 5, lote 49. Requisito R11.

- A lista de avisos do rodapé passa a dizer **onde** com os nomes do arquivo:
  `pele "default" › desenho "body"`, `osso "head" › rotation`,
  `animação "walk" › linha 1`, `cabeçalho › version`. Antes, o endereço de
  máquina (`/skins/0/attachments/body`).
- As frases de forma fixa do leitor saem em português: imagem que não está em
  nenhum atlas, valor desconhecido, versão mais nova que o leitor.
- **Ir para** (ícone de mira): escolhe o elemento e abre o painel dono —
  Árvore, Imagens, Animações, Peles, Regras ou Propriedades.
- **Conserto** quando há: imagem que falta → *Trocar imagem…* (abre a troca do
  painel Imagens); valor desconhecido → *Gravar o padrão* (um passo de
  desfazer). Os dois em ícone, com a frase inteira na dica.
- 8 testes novos (`lote49-avisos-com-nome.test.ts`). 2.390 testes.

### v8.4 — Acrescentado: Definir pivô à mão; copiar e colar pivô — 10/09/2026

Plano pivô e Animando, lote 58. Para a imagem que ainda não tem rig.

- **Definir pivô…**, no botão direito de cada imagem da aba Imagens e num
  botão com ícone de mira ao lado do Carimbar (imagem do desenho escolhido na
  Árvore). A janela mostra a imagem com a cruz; um clique na articulação põe
  o pivô ali, e **nove pontos** (cantos, meios, centro) acertam os casos
  comuns. `Enter` grava, `Esc` desiste.
- Se a imagem já é usada, a janela avisa: *N desenhos usam esta imagem e
  serão recolocados pelo pivô novo*. E recoloca, no mesmo passo de desfazer,
  mantendo o tamanho de cada desenho. Carimbar de novo dá o mesmo número.
- **Copiar pivô / Colar pivô** no botão direito: colar entre tamanhos
  diferentes leva a **proporção**, como o Spriter.
- 8 testes novos (`lote58-pivo-a-mao.test.ts`). 2.382 testes.

### v8.3 — Mudado: montar enquanto anima; apagar poda as linhas — 10/09/2026

Plano pivô e Animando, lote 57. Nenhum campo novo.

- **Criar osso (`N`), Ponto (`O`) e Caixa (`X`) valem em Animando**, como no
  Spriter. O osso é medido contra a pose animada do pai, nasce onde foi
  desenhado, e entra na Montagem. Rodapé: *Osso novo entra na Montagem e vale
  em todas as animações*. Malha e Pesos continuam só da Montagem. Em Animando,
  redesenhar (`Alt`) e prender desenhos (`Ctrl`) dizem que são da Montagem.
- **Imagem solta na cena em Animando, com Gravar sozinho ligado**, aparece só
  nesta animação: o slot nasce vazio na Montagem, a pele ganha o desenho, e a
  animação ganha a chave `null` em 0 e o nome no tempo da agulha. Desligado,
  como antes.
- **Corrigido: apagar um osso ou slot animado deixava linhas órfãs** na
  animação. Agora elas saem junto, com as outras referências (máscara, morph,
  parâmetro, ordem de desenho). Desfazer devolve o mesmo texto.
- 10 testes novos (`lote57-animando-livre.test.ts`); 3 testes antigos mudaram
  de expectativa (lotes 11, 30 e 33). 2.374 testes.

### v8.2 — Acrescentado: Carimbar pivôs; a imagem trocada cai no lugar — 10/09/2026

Plano pivô e Animando, lote 56. O editor passa a usar o pivô do lote 55.

- **Carimbar pivôs**, botão com ícone de carimbo na linha da busca da aba
  Imagens. Calcula o pivô de cada imagem a partir do personagem montado e grava
  no atlas. Um passo de desfazer. A dica traz a regra da arte: *desenhe cada
  variação no quadro da original, com a articulação no mesmo pixel*.
- **Um pivô por imagem.** Imagem usada em dois lugares com pivôs diferentes
  não é carimbada: o painel avisa, com o botão **Duplicar no atlas** do lado.
  Botão direito numa imagem: **Duplicar no atlas** (a cópia vai para o desenho
  escolhido na Árvore, já carimbada).
- **A troca de imagem cai no lugar.** "Trocar a imagem em todas as peles" e
  soltar uma imagem num **desenho** da Árvore: com pivô, `x/y` novos pelo
  pivô; sempre sem `width/height`, então a imagem nova não sai esticada.
  Desfazer devolve o anexo por texto. Malha: só o `path`.
- **Soltar uma imagem num slot da Árvore** cria o desenho nele, já no lugar
  pelo pivô (sem pivô, no centro do osso), com a bolinha ○.
- Miniaturas da aba Imagens com uma **cruz laranja no pivô**.
- **Salvar e exportar gravam o atlas carimbado**: `.bone` + atlas, `.bonez`,
  pacote por pele. Um atlas aberto do disco é regravado quando o carimbo o
  mudou. O `.bonez` passou a levar as páginas de todos os atlas (com o pacote
  importado ao lado, pulava as do arquivo).
- `formato/exemplos/heroi.atlas.json` sai carimbado: 20 regiões (`face` é
  malha e fica de fora).
- 28 testes novos (`lote56-pivo-carimbo.test.ts`). 2.364 testes.

### v8.1 — Corrigido: soltar imagem não apaga as peças; começa na primeira animação — 10/09/2026

Dois pedidos do Humberto, na tela do herói. Fora do plano; só editor.

- **Soltar um PNG na janela quebrava as peças.** O "Importar imagens" (e o
  PSD) trocava **todos** os atlas pelo pacote recém-empacotado: as dezenove
  peças do herói ficavam sem imagem e o rodapé contava 42 avisos. Agora o
  pacote entra **ao lado** dos atlas que vieram com o arquivo (`mergedAssets`);
  só o pacote anterior do próprio acervo sai, porque o novo o contém inteiro.
- **O pacote não leva o nome de um atlas alheio.** `heroi.bone` com
  `heroi.atlas.json` do disco: o pacote vira `heroi-imagens.atlas.json` (e
  depois `heroi-imagens2`), entra em `assets.atlases` como linha nova, e o
  Salvar não grava mais por cima do atlas do herói.
- **O programa começa na primeira animação.** `setFile` abre a primeira
  animação do arquivo, em Animando. O arquivo que lembra a animação aberta
  ganha, se ela ainda existir; sem animação nenhuma, fica a Montagem.
- 12 testes novos (`conserto-atlas-e-primeira-animacao.test.ts`). 2.307 testes.

### v8.0 — Acrescentado: pivô por região do atlas — 10/09/2026

Plano pivô e Animando, lote 55. Decisão do Humberto de 10/09/2026.

- **`pivotX`, `pivotY` na `Region` do atlas** (§10.3, Apêndice A 71). Px da
  imagem **original**, da esquerda e de baixo, como `offsetX/offsetY`.
  Opcional; ausente = o centro. Sem faixa: pode cair fora do desenho.
- **Informativo: a pose não muda.** O runtime TypeScript lê o campo
  (`AtlasRegionData.pivotX/pivotY`) e não o usa na conta; o anexo continua
  com `x/y`. Provado no herói, três animações, com e sem pivô: mesmo texto.
- A conta de ida e volta (anexo ↔ pivô) está escrita na §10.3, para editores
  e ferramentas.
- Schema aceita `number`; validador da linha de comando e da web (esquema
  recompilado).
- **Empacotador:** o pivô passa da entrada à saída; o corte da borda não o
  move; com escala, encolhe junto. O mesmo desenho com pivô diferente **não**
  vira apelido: fica região própria.
- **Reempacotar uma pele** (`repackAtlas`: `npm run fatiar` e exportar por
  pele) preserva o pivô.
- **Editor:** `atlasToJson` grava o pivô quando ele existe. O carimbo vem no
  lote 56.
- Anotado como glacê, não feito: runtime Python, caso de conformidade, manual.

### v7.9 — Acrescentado: acabamento: pixel duro, setas nos campos, manual — 10/09/2026

Rodada 5, lote 48. Quatro pequenos do `ESTADO.md`.

- **Arte em pixel desliga o filtro (R9).** O renderizador do runtime põe
  `imageSmoothingEnabled = false` quando o arquivo tem `pixelArt: true` —
  inclusive no rascunho da tinta. Vale na cena, na Prévia, nas miniaturas, no
  traçado da Malha e em toda exportação de imagem (PNG, sequência, folha, GIF,
  WebM). Função pura nova `smoothingFor`, no runtime.
- **Setas nos campos de número.** `↑` e `↓` andam um passo; `Shift` dez, `Alt`
  um décimo (`stepValue`, arredondado a 6 casas). Nas Propriedades, na ficha
  rápida e nas caixas do tocador (velocidade 1%, tempo e duração um quadro). A
  tecla fica no campo: não anda na linha do tempo. Segurar é um passo de
  desfazer só.
- **Cabeçalho que tapava a primeira linha:** conferido em 1440×900, o defeito
  não existe mais desde as abas do item 19. Dois testes prendem isso.
- **Manual:** cap. 1 em inglês com a tabela do menu Arquivo (e **PSD com
  ossos…** nas duas línguas); cap. 2 com as setas; cap. 7 com Arte em pixel.
  A linha R9 saiu de "O que ainda não funciona".

### v7.8 — Mudado: o PSD… de sempre pula a camada `ossos` — 10/09/2026

Ajuste do planejador sobre o lote 45: "só esta camada é lida como esqueleto;
ela não vira desenho".

- **Arquivo → Importar → PSD…**, soltar o arquivo na janela e o
  `importar-psd` sem `--ossos`: a camada `ossos` (ou o grupo) **fica de fora**,
  sem virar slot nem entrar no atlas, e sai um aviso: *Camada "ossos" ignorada:
  use PSD com ossos… para ela virar esqueleto*.
- O `heroi.psd` pelo importador de sempre: 19 slots, nenhum da camada `ossos`,
  um aviso (testado).
- Função pura nova `splitBonesLayers`, no importador do editor.
- Manual caps. 00 e 02 (duas línguas) e o `leiame.md` dos exemplos com a frase
  nova.

### v7.7 — Mudado: o `heroi.psd` de exemplo traz os ossos desenhados — 10/09/2026

Pendência do lote 45, liberada pelo planejador: o arquivo é gerado, e o chat do
formato parou.

- `formato/exemplos/heroi.psd` regravado por
  `montar-psd.mjs --ossos`: 36 camadas (19 desenhos e 17 ossos), 5 grupos, a
  mesma tela de 162 × 284 px.
- **PSD com ossos…** nele: a arte volta no mesmo lugar (0 px), 18 ossos, 16
  com o pai certo, ângulo até 1,64°. O **PSD…** de sempre continua trazendo a
  arte no mesmo lugar (teste do lote 36), e agora avisa da camada `ossos`.
- O manual cap. 00 (duas línguas) e o `leiame.md` dos exemplos dizem qual dos
  dois importar.

### v7.6 — Acrescentado: Transformar: mover, girar e escalar numa ferramenta só — 10/09/2026

Rodada 4, lote 47. Pedido do Humberto: "como é no Spriter".

- Ferramenta nova **Transformar** (`T`), logo depois de Selecionar, e **a
  ferramenta de partida** ao abrir. A caixa tracejada do Spriter: quadradinhos
  nos cantos e no meio dos lados, o pivô, a haste com a bolinha.
- Arrastar dentro move; a bolinha gira (`Shift`: 15°); um canto escala nos
  dois eixos (`Shift`: proporção); o meio de um lado, num eixo só; em cima de
  algo não escolhido, escolhe e move; fora, o retângulo. Um clique escolhe.
- **Nenhuma conta nova**: a ferramenta repassa o arrasto para Mover, Girar,
  Escalar ou Selecionar, e o arquivo sai igual ao da ferramenta de sempre
  (testado texto contra texto). Eixos, Compensar e o `Ctrl` que clona valem
  igual. Mover, Girar, Escalar e Inclinar continuam na barra.
- Cursor por zona (o contrato ganhou `onHover?`, opcional), rodapé com o gesto
  e o número, um passo de desfazer por arrasto.
- O Escalar ganhou a trava de eixo do meio de lado.
- Ajuda → Atalhos passou a listar as teclas das ferramentas.
- Módulos novos: `viewport/transform-box.ts` (`boxFromCorners`,
  `transformHit`, `cursorForHandle`, `transformBox`) e
  `viewport/tools/transform-tool.ts`.
- Manual, capítulos 2 e 4, nas duas línguas, com foto antes e depois.

### v7.5 — Acrescentado: F3, as três heranças que eram reservadas ganharam fórmula — 10/09/2026

Plano da rodada 4, F3. Decisão D3 do Humberto; opção (a) do planejador. Feito
pelo executor, por ordem do Humberto.

- §5.3: as oito combinações de `inherit*` têm modo. Os três novos:
  `noRotation` (F T T), `noReflection` (T T F), `onlyReflection` (F F T).
  Nenhuma combinação é L1: saíram a linha da §2.5 e o código
  `RANGE_INHERIT_RESERVED` da §12.3.
- §5.4: cada um muda uma ou duas linhas de um modo do Spine. `noRotation`
  guarda o sinal do determinante no `noRotationOrReflection`; `noReflection` é
  o `normal` com o pai desrefletido; `onlyReflection` é o `onlyTranslation` com
  a segunda coluna virada. A virada do esqueleto inteiro não conta (`flip`, o
  teste que o `noScale` já fazia).
- §5.5 (a volta) e a IK de 1 osso (6.2) ganharam os três ramos.
- Os dois runtimes: `inheritMode`, `updateWorldTransform`,
  `updateAppliedTransform`, `ik1`. O loader parou de avisar "reservada".
- Casos C-283, C-284 (com um pai cisalhado) e C-285: **53 de 53** nos dois
  runtimes, e os dois concordam campo a campo.
- Apêndice A, 70. Apêndice B, 1: fechada. O manual cap. 5 perdeu a linha "ainda
  não têm fórmula", nas duas línguas.

### v7.2 — Acrescentado: F2, trocar de pai no meio da animação — 10/09/2026

Decisão D1 do Humberto, 10/09/2026, a segunda das "duas coisas". Reabre e
fecha a decisão 7 do Apêndice B. Formato, dois runtimes e importador.

- **Timeline `bone` / `parent`** (§9.4): valor é o nome de um osso ou `null`
  (= o pai do arquivo), só stepped, nível B. **Semântica do Spriter**: da
  chave em diante os locais do osso são medidos do pai novo; o runtime não
  converte nada.
- **Ordem de cálculo refeita** (§5.6): quando o pai aplicado muda, a ordem
  pai-antes-de-filho é recalculada naquele quadro e guardada até mudar de
  novo. Voltar à setup pose devolve o pai do arquivo (§5.1).
- **Ciclo ignorado com aviso**, L2 `PARENT_CYCLE` (§12.3). Constraints que
  apontam para o osso continuam apontando.
- Schema: `parent` na lista de propriedades de osso, chaves `keyNameOrNull`,
  nas timelines e nos alvos de driver.
- Runtime TypeScript: `Bone.parent` mutável, `Bone.setupParent`,
  `Bone.setParent` (recusa ciclo), `Skeleton.updateOrder` +
  `rebuildUpdateOrder`, `Skeleton.warnings` + `warnOnce`, `applyParentKey`
  usado por `applyAnimation`, `AnimationState` e o driver. Runtime Python: o
  mesmo, `set_parent`, `update_order`, `warn_once`, `apply_parent_key`.
- **Importador do Spriter para de assar**: a chave da mainline cujo
  `bone_ref.parent` não é o pai do arquivo vira uma chave `parent`; `--assar`
  na linha de comando mantém o comportamento antigo (um pai só, com aviso).
- Casos **C-281** (a mão troca de pai e a ordem de cálculo muda, com o pai
  novo animado), **C-282** (laço: volta ao pai do arquivo) e **C-286** (ciclo
  ignorado). `comparar-runtimes` 50 de 50. Três testes novos em
  `runtime/testes/trocar-de-pai.test.ts`. Apêndice A, 69.
- Editor, depois (executor): em Animando, o Reparent grava a chave `parent`
  mais os locais convertidos, em vez de voltar para a Montagem.

### v7.0 — Acrescentado: F1, ordem de desenho por pele: `skin.drawOrder` — 10/09/2026

Decisão D1 do Humberto, 10/09/2026 ("quero essas duas coisas"). Formato e os
dois runtimes, chat do formato.

- **`skin.drawOrder: {slot, offset}[]`** (§4.4): a skin desloca a ordem de
  desenho enquanto está ativa, com a mesma conta da timeline `drawOrder`. A
  capa vestida vai para a frente do braço sem animação nenhuma.
- **Ordem base** (§4.4, §5.1, §9.5): ordem do array `slots` + o `drawOrder`
  de cada skin ativa, na ordem de resolução (`default`, includes, a skin). A
  timeline `drawOrder` mede a partir da ordem base, e a chave `[]` volta para
  ela, não para a ordem do array. Trocar de skin recalcula.
- Schema: `skin.drawOrder`. Runtime TypeScript: `Skeleton.baseDrawOrder`,
  `applyDrawOrder` recebe a lista `{slot, offset}` e aplica sobre a base
  (`draw-order.ts` novo, um algoritmo só para loader, animação, driver e
  `AnimationState`). Runtime Python: `order_from_offsets`, `base_draw_order`.
- Caso **C-280** (ordem por pele) nos dois runtimes; `comparar-runtimes` 47 de
  47. Quatro testes novos em `runtime/testes/ordem-por-pele.test.ts`. Apêndice
  A, 68.
- Editor, depois (executor): mover na aba Ordem com uma pele em edição grava
  na pele.

### v6.8 — Acrescentado: F4, a animação padrão é a primeira da lista — 10/09/2026

Decisão D7 do Humberto, 10/09/2026, plano da rodada 4. Só formato, chat do formato.

- **§4.6, uma frase normativa:** a primeira animação de `animations` é a
  padrão. É a que um visualizador DEVERIA abrir e a que um jogo PODE tocar sem
  pedir nome. Zero campo novo: um gravador que quer outra padrão reordena o
  array. Apêndice A, decisão 67. O botão "Mandar para o topo" na aba Animações é
  o lote 44, do executor.

### v7.4 — Acrescentado: Configurações: trocar de animação tocando e tempo de mistura — 10/09/2026

Rodada 4, lote 46. Respostas D8 e D2 do Humberto. Zero campo novo no formato.

- **Arquivo → Configurações do projeto…** ganhou **Ao trocar de animação
  tocando**: `Terminar a atual antes` (padrão) ou `Trocar na hora`. Com
  "terminar", a clicada entra na fila (sinal **⏭** na aba Animações, "próxima"
  na dica) e começa do zero quando a atual chega ao fim. Parado, troca na hora.
  Mora no `RECORTE_editor_state` (`view.switchMode`).
- **Tempo de mistura**, em segundos: grava `defaultMix` (§4.6) em **todas** as
  animações, um passo de desfazer só. Mostra "vários" quando diferem; aplicar
  sem mexer não grava nada.
- O tocador do editor **mistura** na troca por esse tempo, pelo `AnimationState`
  do runtime — a mesma conta da Prévia e do jogo.
- A dica dos dois diz que isso não é o Repetir.
- Novos: `switchPlan`, `arrivalPlan`, `mixSeconds` (tocador); `SetDefaultMixAll`,
  `commonDefaultMix`, `formatMix`, `parseMixAnswer`; `EditorDoc.crossfade?`
  (opcional, no contrato); campo de lista no `askForm`.
- Manual, capítulos 1, 4 e 7, nas duas línguas (o cap. 1 em inglês não tem a
  tabela do menu).

### v7.3 — Acrescentado: ossos desenhados no PSD — 10/09/2026

Rodada 4, lote 45. Resposta do Humberto à decisão D9: uma camada de linhas por
cima da arte, e as linhas viram ossos. Zero campo novo no formato.

- **Arquivo → Importar → PSD com ossos…** e `importar-psd --ossos`: a camada
  `ossos` (ou o grupo `ossos`) vira esqueleto. Cada linha é um osso; a
  bolinha marca a base; a base que encosta noutra linha (até 12 px) é filha
  dela; na encruzilhada, a linha bem mais curta é o pai. Nomes `osso_1`,
  `osso_2`… da raiz para as pontas.
- Cada desenho vai para o osso cuja linha mais passa por cima dele, **no mesmo
  lugar da tela**: só passa a ser medido a partir do osso.
- O **PSD…** de sempre não muda um byte. Quando acha uma camada `ossos`, avisa
  como fazer ela virar esqueleto.
- Módulo puro novo `ferramentas/src/importar/psd-bones.ts`: `strokesFromLayer`,
  `hierarchyFromStrokes`, `assignLayersToBones`, `buildPsdRig`. A linha de
  comando e o editor usam o mesmo.
- `montar-psd.mjs --ossos` põe no PSD do herói um grupo `ossos`, uma camada por
  osso. `conferir-arte.mjs --ossos` mede a volta: no herói, 16 de 18 ossos
  voltam com o pai certo, ângulo até 1,64°. Os dois que não voltam: o cabelo
  (nasce a 24 px da cabeça) e o alvo do IK (mora na ponta do antebraço).
- Manual, capítulo 2, nas duas línguas: a seção **Com os ossos desenhados no
  PSD**, com imagem.

### v7.1 — Acrescentado: a primeira da lista é a padrão: Mandar para o topo — 10/09/2026

Rodada 4, lote 44. Resposta do Humberto à decisão D7: "1 da lista". A frase
na §4.6 é do chat do formato (F4); aqui é só o editor.

- Aba **Animações**: botão em ícone **Mandar para o topo**, com a dica "A
  primeira da lista é a que o jogo abre". Também em **Animação → Mandar para o
  topo**, num degrau próprio (o bloco passaria de seis itens).
- A primeira linha da lista ganha uma estrelinha **★** discreta, e a palavra
  **padrão** na dica.
- Comando novo `MoveAnimationToTop`, com `revert` exato: o arquivo volta igual,
  texto contra texto. Já sendo a primeira, a barra diz e nada muda. Função
  nova `defaultAnimation`.
- Zero campo novo no formato.
- Manual, capítulo 4, nas duas línguas: a seção **A animação padrão**.

### v6.9 — Acrescentado: vídeo WebM pela janela Exportar imagem — 10/09/2026

Rodada 4, lote 43. Resposta do Humberto: WebM sim, MP4 não.

- Formato novo em **Arquivo → Exportar → Imagem…**: **Vídeo WebM**. O editor
  desenha os quadros, toca a sequência num canvas fora da tela e o
  `MediaRecorder` do navegador grava um `.webm`. Chrome, Edge e Firefox. Zero
  dependência.
- Campo **Voltas no vídeo**: quantas vezes a animação toca dentro do vídeo.
- A janela diz: "O tempo é o do relógio do navegador, não quadro a quadro. Para
  quadro exato, use a sequência de PNG."
- Navegador sem gravador: o item fica cinza, com o motivo na dica.
- Só no editor. A linha de comando não tem navegador; a mensagem do `ffmpeg`
  continua lá. MP4 e AVI continuam fora.
- Funções puras novas em `io/export-image.ts`: `webmPlan`, `webmSupport`,
  `canRecordWebm`.
- Manual, capítulo 7, nas duas línguas: a seção **Vídeo WebM**.

### v6.7 — Acrescentado: clonar arrastando, guias, escolher filhos e pais — 10/09/2026

Rodada 4, lote 42. Spriter 8 da lista dos buracos. Fecha a rodada 4.

- **`Ctrl` + arrastar em cima do escolhido**, na ferramenta **Mover**: clona e
  arrasta o clone — o membro inteiro, como o Duplicar do lote 37. O original
  não se mexe, e o arrasto inteiro é **um passo de desfazer**. Um desenho solto
  clonado anda junto. Só na Montagem.
- **Guias.** Arrastar a partir da régua de cima cria uma guia deitada; da
  esquerda, uma em pé. Soltar de volta na régua desiste. O **Mover imanta** a
  6 px de tela (com `Shift`, não). **Exibir → Guias**, **Travar guias** (as
  que existem ficam tracejadas) e **Limpar guias**; no painel Exibição, um
  grupo **Guias**. Moram em `RECORTE_editor_state.view.guides`: o núcleo do
  `.bone` não muda um byte.
- **Editar → Escolher → Os filhos** (`]`) e **Os pais** (`[`). A tecla `Z` é de
  Inclinar; os colchetes são os do Photoshop, e estavam livres.
- Módulo puro novo `viewport/guides-model.ts`: `snapToGuides`, `addGuide`,
  `guideFromRuler`, `parseGuides`. Comando novo `CloneDrag`; funções
  `descendantsOf`, `ancestorsOf`, `selectChildren`, `selectParents`.
- Manual, capítulo 2, nas duas línguas: o gesto, as duas teclas e a seção
  **Guias**.

### v6.6 — Acrescentado: exportar: trecho, todas, pacote por pele e `fatiar .bonez` — 10/09/2026

Rodada 4, lote 41. Spine 7, Nenhum 6 e Nenhum 7 da lista dos buracos.

- **Exportar → Imagem…** ganhou **De** e **Até** (segundos; nascem `0` e a
  duração) e **Todas as animações** — um arquivo por animação, `heroi-idle.gif`,
  `heroi-walk.gif`, `heroi-attack.gif`. Só a linha de comando fazia isso.
  De maior que Até, De negativo ou Até depois do fim: **recusado por escrito**,
  e o campo errado volta. A conta é pura: `exportPlan`.
- **Exportar → Por pele…** ganhou **Pacote .bonez com o atlas**: um arquivo só,
  com o `.bone` fatiado, o atlas com **só** as regiões que os anexos que
  sobraram citam, e as páginas reempacotadas pelo mesmo `repackAtlas` da linha
  de comando. A frase "meia exportação é pior que nenhuma" deixou de valer:
  agora é um arquivo.
- **`npm run fatiar` lê `.bonez`**, e com pacote na entrada **grava pacote na
  saída**. Antes ele recusava e mandava converter.
- Corrigido: a barra da janela Exportar imagem mostrava `quadroâ€¦`.
- Manual, capítulos 3 e 7, nas duas línguas: três linhas saíram de "O que
  ainda não funciona". O capítulo 3 ficou sem pendência nenhuma.

### v6.5 — Acrescentado: ponto e caixa dentro de um slot que já existe — 10/09/2026

Rodada 4, lote 40. Spine 4 da lista dos buracos.

No formato, ponto e caixa **sempre foram** anexos (§7.1): trocam por chave
`slot/attachment` e por pele. Quem não deixava era o editor, que criava um
slot novo para cada um.

- **Esqueleto → Novo → Ponto neste slot** e **Caixa neste slot**. Deixam
  escolhido só o slot e pegam a ferramenta; o `Alt` + arrasto de sempre põe o
  anexo **dentro do slot**, na pele do lápis, com a bolinha **○** — ele não vira
  o desenho ativo. A bolinha da Árvore e a chave `slot/attachment` fazem o
  resto.
- A regra é pura (`shapeTarget`): **um slot escolhido e nenhum osso** → dentro
  dele. Com o osso junto — o clique na cena escolhe osso, slot e desenho —
  continua o de sempre, slot novo. O gesto de todo dia não mudou de lugar.
- O slot continua escolhido depois de criar: o próximo arrasto entra no mesmo
  slot. Nome livre olhando todas as peles do slot: `hand_ponto`, `hand_ponto_2`.
- Comando novo `AddAttachmentToSlot`, com `revert` exato texto contra texto —
  inclusive quando cria o mapa do slot ou a pele inteira.
- Provado no runtime de referência: com a chave em `hand` valendo
  `hand_ponto`, o canal `points` do dump traz `hand/hand_ponto` **no tempo da
  chave, e não antes**; o mesmo para `boundingBoxes`.
- Manual, capítulo 2, nas duas línguas: a seção nova diz os dois caminhos.

### v6.4 — Acrescentado: peles na tela — 10/09/2026

Rodada 4, lote 39. Spine 3 e Spriter 7 da lista dos buracos.

- **Só com a pele** agora existe no **osso** também (grupo **Peles** de
  Propriedades), e não só na regra.
- Com a caixa marcada, nasce embaixo dela **Peles que ativam**: uma caixa por
  pele. Marcar põe o nome em `skin.bones` (ou `skin.constraints`, numa regra);
  desmarcar tira. **Antes, essa lista só se escrevia no arquivo à mão.**
- Marcar **Só com a pele** com uma pele no lápis já põe o osso nela. Sem pele
  no lápis, o rodapé diz *"Marque em que pele, em Propriedades"*. A `default`
  não entra na lista: ela está sempre ligada.
- Desmarcar tira o nome de **toda** pele, no mesmo passo de desfazer — senão o
  validador avisaria `HINT_SKIN_BONE`.
- **Trocar a imagem em todas as peles…**, no botão direito de um desenho na
  Árvore e em **Esqueleto → Trocar imagem nas peles…**. Abre o painel Imagens
  com uma faixa e a busca no foco; a imagem clicada troca em toda pele que usa
  a mesma naquele slot. `Esc` ou **✕** cancela. Um passo de desfazer.
- Comandos novos, com `revert` exato texto contra texto: `ToggleSkinBone`,
  `ToggleSkinConstraint`, `SetSkinRequired`, `SwapImageEverywhere`.
- Manual, capítulo 3, nas duas línguas: duas linhas saíram de "O que ainda
  não funciona", e entraram os dois passos.

### v6.3 — Corrigido: escondido é escondido, de uma vez — 09/09/2026

Anotação 27. A mesma família de defeito voltou **cinco vezes** — lotes 14, 16,
19, 30 e 37 —, sempre do mesmo jeito: `[hidden] { display: none }` é regra da
folha do **navegador**, e qualquer regra de autor com `display` passa por cima
dela. O elemento fica marcado como escondido no código, continua desenhado, e
continua recebendo clique.

- **Uma regra global**, no topo do `shell.css`:
  `[hidden] { display: none !important }`. `!important` é remédio forte e está
  aqui de propósito: esconder não é questão de estilo, é questão de existir na
  tela ou não.
- **Os consertos locais saíram** — eram nove seletores espalhados por quatro
  folhas, cada um nascido de um defeito diferente.
- **Um teste varre todo `.css` de `editor/src`** e recusa `display` diferente
  de `none` num seletor `[hidden]`; outro exige que a regra chegue ao
  `programa/` montado, que é onde o editor abre de verdade.
- A conferência sem cabeça ganhou o campo `escondidoEscondido`: no herói,
  **32 elementos marcados, 0 aparecendo**.

### v6.2 — Acrescentado: Duplicar — 09/09/2026

Anotação 26, a última linha da lista **"O básico que falta"**.

- **`Ctrl+D` duplica o que está escolhido.** Um **osso vem com o membro
  inteiro**: os filhos dele e os desenhos de todos eles. Antes disso, montar a
  metade de trás de um personagem era refazer braço, antebraço e mão à mão —
  `Copiar` e `Colar` ficavam cinzas com um osso escolhido, porque eles são só
  de chaves.
- **Nomes**: `arm` → `arm_2` → `arm_3`. O sufixo é **trocado**, e não
  empilhado: `arm_2_2` ninguém lê.
- **A cópia nasce 20 px à direita**, no mundo, e **já escolhida**. Os filhos
  vão junto, mantendo a distância. Giro, escala e inclinação saem idênticos.
- **As regras não são duplicadas nem redirecionadas**, e a tela **diz quantas e
  quais** ficaram de fora: uma regra de IK copiada às cegas passaria a puxar
  dois braços pelo mesmo alvo.
- Botão em ícone no cabeçalho da **Árvore**, ao lado de Apagar, e
  **Editar → Duplicar**. Um passo de desfazer.
- **Espelhar ao duplicar fica para depois**, de propósito: precisa da decisão
  do eixo e da regra de nome (`_esq` / `_dir`), que são do dono.

### v6.1 — Acrescentado: chegar no programa — 09/09/2026

Anotações 23 e 24, as linhas 1, 2 e 3 da lista "O básico que falta".

- **Soltar arquivo na janela funciona.** Era o primeiro gesto de quem chega de
  outro programa, e não fazia nada: `dataTransfer.files` não era lido em canto
  nenhum. Agora `.bone` abre, `.psd` importa, projeto de Spine, DragonBones ou
  Spriter importa, e imagem entra no atlas. Uma **faixa diz o que vai
  acontecer** antes de acontecer, com o nome do arquivo. Quem decide é
  `dropPlan`, um módulo puro.
- **Vários esqueletos de uma vez: o programa PERGUNTA qual abrir**, em vez de
  recusar. O próprio herói vem com a `espada.bone` do lado, que é o esqueleto
  filho dele.
- **O documento vazio diz o que fazer**: três botões grandes no meio da cena —
  **Importar PSD**, **Abrir o herói** e **Começar vazio** —, que somem no
  primeiro osso ou na primeira imagem. **Arquivo → Abrir o herói (exemplo)** é a
  mesma porta, para quando as boas-vindas já sumiram.
- **Nasceu `formato/exemplos/heroi.psd`**, que faltava para o passo 1 do manual
  ser percorrível. Ele é gerado do próprio herói por
  `node ferramentas/montar-psd.mjs`, que é o **inverso do importador**: desenha
  um slot de cada vez com o mesmo rasterizador da prova visual, recorta o que
  ficou opaco e grava uma camada por desenho, com as pastas dos slots virando
  grupos. 19 camadas, 4 grupos, 162×284.
- **A volta é exata, e há um programa que mede isso**:
  `node ferramentas/conferir-arte.mjs A.bone B.bone` desenha os dois e compara
  onde cada peça caiu. Importar o `heroi.psd` de volta dá **0 px** de diferença
  de posição e de tamanho, nas 19 peças.

### v6.0 — Acrescentado: a aba Ordem ganhou botões — 09/09/2026

Anotação 25, a linha 4 da lista "O básico que falta": a aba **Ordem** tinha
**zero botões**. Mudar a ordem de desenho era arrastar a linha, ou uma tecla
escrita só na dica dela.

- **Seis botões no alto da aba**, em ícone com o nome na dica: **Trazer para a
  frente** (`Ctrl+↑`) · **Mandar para trás** (`Ctrl+↓`) · **Frente de tudo**
  (`Ctrl+Shift+↑`) · **Fundo de tudo** (`Ctrl+Shift+↓`) · **Nova pasta** ·
  **Tirar da pasta**. Cinzas sem nada escolhido.
- **As duas "de tudo" são novas**, e vão num passo de desfazer só. Peça de pasta
  leva **o pedaço vizinho da pasta** junto: tirar uma peça do meio da capa e
  jogá-la na frente desmancharia a pasta sem ninguém pedir.
- As seis entram também no **menu Esqueleto**, com a mesma tecla, porque a barra
  da aba só existe com a aba aberta.
- Seis ícones novos, desenhados nas regras da casa.

### v5.9 — Corrigido: trocar de pai não move mais nada — 09/09/2026

Anotação 19, achada ao fechar o lote 31: reparentar guardava a pose **local**,
então o filho **pulava de lugar** na tela. Era de sempre, nos três caminhos; o
gesto novo pôs à vista.

- **A pose de MUNDO é preservada**, como no Spriter e no Spine: `L' = P'⁻¹ · W`,
  a mesma conta do **Compensar** do lote 6, feita pelo mesmo `localFromWorld`.
  O osso fica exato (ele tem `shearY` para guardar qualquer inclinação); o
  desenho de um slot também, e quando os dois ossos têm escalas **diferentes
  nos dois eixos** — o único caso em que uma `region` não tem onde escrever a
  inclinação — a tela avisa que ele entortou um pouco.
- **Um comando só, `Reparent`**, em `editor/src/doc/reparent.ts`. Eram três:
  `ReparentBone` (arrasto na Árvore), `ReparentMany` (tecla `P` e menu) e o
  campo **Osso** do painel Propriedades, que escrevia direto no arquivo. Os
  **quatro** caminhos passam agora pela mesma porta.
- **Com uma animação aberta, volta para a Montagem antes**, e diz que voltou:
  estrutura é da pose de repouso, e mexer nela com a animação aberta escreveria
  a mudança onde a animação não a vê.
- Malha **com pesos** não é tocada: o mundo dela vem do `binding`, e não do osso
  do slot. Mexer nela moveria o desenho de verdade.

### v5.8 — Corrigido e acrescentado: o básico que faltava — 09/09/2026

Anotações 20, 21 e 22, as três primeiras da lista **"O básico que falta"** que
saiu de percorrer o capítulo 00 do manual no editor rodando.

- **A tecla obedece ao modo (20).** Em Animando os cinco botões de estrutura
  somem da barra desde o lote 17 — mas apertar `N` ainda punha **Criar osso** na
  mão, e o arrasto criava osso com a animação aberta. `toolForKey(tecla, modo)`
  passa a olhar o `modes` da ferramenta, e o rodapé diz *"Criar osso é da
  Montagem. Ctrl+Tab troca de modo"*.
- **Texto quebrado (21).** A janela **Exportar imagem** dizia "AnimaÇÃo",
  "Vídeo MP4" e "Repetições do GIF" com o rastro de UTF-8 lido como Latin-1.
  Doze frases lá e onze no `ferramentas/src/exportar/quadros.ts`. Um teste novo
  varre **todo `.ts` do projeto** e recusa a dupla que denuncia isso.
- **Nenhum item de menu fica cinza para sempre (22).** Eram **dez**, prometendo
  lotes 4, 6, 7, 9 e 12 — todos já passados. Nove viraram função:

| Item | O que ele faz agora |
|:---|:---|
| **Arquivo → Abrir recente…** | os cinco últimos, numa janela com busca; reabre com as imagens que vieram junto |
| **Arquivo → Sair** | fecha a aba, com o aviso de arquivo não salvo |
| **Editar → Selecionar tudo** (`Ctrl+A`) | todos os ossos e todos os desenhos |
| **Editar → Buscar na Árvore…** (`Ctrl+F`) | campo no alto do painel, filtra pelo nome sem acento e sem caixa |
| **Esqueleto → Novo → Imagem no slot…** | abre o painel Imagens com a busca no foco |
| **Animação → Tocar para trás** (`Shift+Espaço`) | toca do fim para o começo |
| **Animação → Chave anterior / seguinte do escolhido** (`Shift+↑` `Shift+↓`) | pula só entre as chaves do que está escolhido |
| **Animação → Selecionar todas as chaves** | escolhe as 87 chaves do herói de uma vez |

  O décimo, **Novo → Esqueleto filho…**, **saiu do menu**: sem o encaixe por
  nome ele não serve para nada, e a razão está escrita em `MOVED_OUT`, no
  `menus.ts`. A auditoria dos menus passou a **recusar** item que nasce apagado
  prometendo um lote, então isto não volta sozinho.

### v5.7 — Acrescentado: miniatura para todo tipo de desenho — 09/09/2026

Anotação 18. O Humberto apontou duas linhas da aba **Ordem** com o quadrado
vazio: *"o que é isso?"*.

- **Quadrado vazio não existe mais.** `hand` é uma **sequência** de três
  imagens, e o `path` dela (`"hand_"`) não é nome de região nenhuma: agora ela
  mostra o **quadro de repouso** (`hand_01`) com um cantinho dizendo **3**.
  `weapon` mostra um **esqueleto filho** (`espada.bone`), que não tem imagem:
  agora a espada é **desenhada** pelo runtime, na pose de repouso, dentro do
  quadrado.
- **Quem não pode ter imagem mostra o ícone do tipo**, com o nome do tipo na
  dica: ponto, caixa de colisão, caminho e máscara. Dois ícones novos, o de
  **caminho** e o de **máscara**.
- Vale nos dois lugares que listam desenho: a aba **Ordem** e a **Árvore**.
- Quem decide é `thumbnailKind`, em `editor/src/panels/thumbnail-kind.ts`, que é
  um módulo **puro** — 10 testes. E a conferência sem cabeça passou a exigir
  **nenhuma linha da Ordem sem imagem nem ícone**: 23 linhas, 0 vazias.

### v5.6 — Acrescentado: o pai pega os filhos, como no Spriter — 09/09/2026

Anotação 17. Nas palavras do Humberto: *"Eu pedi para que o pai pegasse os
filhos: você seleciona o pai e depois seleciona os filhos, como no Spriter."*

- **`P` segurado, com UM osso escolhido, é o gesto novo.** Aquele osso é o pai;
  cada clique na cena pendura um osso ou um desenho nele; **clicar de novo
  solta**, e o filho volta para o pai que tinha; soltar a tecla termina. É o
  `B` do Spriter, e não o `P` do Spine.
- **A mesma tecla continua fazendo o gesto de antes** com dois ou mais
  escolhidos: aperta `P`, clica no pai. Quem decide é a seleção no instante em
  que a tecla desce — `parentGesture(selection)`, em
  `editor/src/viewport/parent-gesture.ts`, que é um módulo puro.
- **O cursor muda e o rodapé diz o que fazer**, com o nome do pai. Cada clique
  é um passo de **Desfazer** com o nome do filho, e não um passo só no fim: o
  arrependimento no meio do gesto custa um `Ctrl+Z`.
- **Esqueleto → Virar filho de…** continua abrindo a lista com busca, que é o
  segundo caminho para o mesmo trabalho.
- Manual nas duas línguas, com as duas fotos do gesto, e 16 testes novos
  (`editor/testes/lote31-pegar-filhos.test.ts`).

### v5.5 — Acrescentado: o manual em PDF — 09/09/2026

Pedido do Humberto: *"me dê uma versão em PDF do manual."*

- **`npm run manual-pdf`**, em `ferramentas/manual-pdf.mjs`. Sai
  `documentos/manual/Manual do Recorte AAAA-MM-DD.pdf` — **125 páginas**, com as
  47 imagens embutidas e 150 links internos, então o índice e as remissões entre
  capítulos continuam clicáveis no PDF.
- **Ele não tem renderizador próprio, e é isso que importa.** Quem monta o
  manual numa página só é o `editor/src/io/manual.ts`, que é o mesmo código do
  **Ajuda → Manual** (`F1`). O programa abre o editor num Chrome headless, pede
  a ele o HTML pronto, acrescenta **só o CSS de impressão** e manda imprimir.
  Um segundo conversor de Markdown viraria, em dois lotes, um PDF dizendo uma
  coisa e o programa dizendo outra.
- O CSS de impressão faz o que o papel exige e a tela não: **cada capítulo começa
  numa página nova**, imagem, tabela e bloco de código **não se partem** entre
  duas páginas, e um título nunca fica sozinho no pé da página.
- O programa **espera todas as imagens carregarem** antes de imprimir, e falha
  se alguma não chegar: uma imagem que falta sai como quadrado vazio, e o PDF
  não avisa.
- Sem o editor servindo em 5173 ele para logo no começo e **escreve o comando**
  que falta rodar.

### v5.4 — Mudado: lote 30, parte 2: o fluxo de trabalho, e "tudo" provado — 09/09/2026

Acréscimo do Humberto ao mesmo lote: *"faça um manual do programa com prints
explicando TUDO que o programa é capaz de fazer, e uma parte explicando qual é
o fluxo de trabalho padrão."* Só documentação e teste; nenhuma linha de
comportamento mudou.

- **Capítulo 0, "O fluxo de trabalho padrão"**, antes do 1: dez passos
  numerados, **um print em cada**, da arte solta até o arquivo do jogo —
  importar, conferir a ordem, criar ossos, prender desenhos, pôr as regras,
  vestir a pele, criar a animação, fazer as chaves, tocar e ajustar, exportar.
  Fecha com a tabela **"Quando voltar um passo"**, que liga o defeito que se vê
  na tela ao passo que o causou. Nas duas línguas.
- **Os sete menus, item por item**, no capítulo 1: **um print por menu**, com
  todos os itens à vista, e a tabela com a tecla, o que cada item faz e o
  capítulo que o explica. Os menus altos foram fotografados numa janela mais
  alta — o menu Animação tem vinte e nove itens e não cabe em 900 pixels, e um
  menu cortado esconderia justamente os últimos.
- **Gestos em duas fotos, o antes e o depois**: o retângulo de seleção e o
  `Ctrl` + arrastar do Criar osso. O `fotos-manual.mjs` ganhou um arrasto de
  verdade, disparado no canvas por `Input.dispatchMouseEvent`, porque um gesto
  não se fotografa apontando para um botão.
- **41 imagens** no total, ainda todas tiradas na mesma sessão, num comando.
- **Teste novo, `editor/testes/lote30-manual-completo.test.ts`:** o outro
  sentido da conta. O teste da parte 1 provava que *nome citado no manual
  existe no programa*; este prova que **função do programa está citada no
  manual** — toda entrada dos sete menus, toda tecla escrita num menu, as onze
  ferramentas com a tecla delas, os treze painéis, as duas metades do
  interruptor e toda ação registrada, varrida do código-fonte. `EXEMPT_MANUAL`
  é a dívida, **com o motivo escrito por linha** e no máximo dez linhas, como o
  `EXEMPT` do lote 29.

Para a conta fechar, o manual ganhou por escrito trinta e dois itens de menu que
antes só existiam em paráfrase — *Preferências…*, *Só este: esconde o resto*,
*Voltar tudo ao repouso*, *Mover para a outra coluna*, *Sobre o Recorte* e
outros —, sempre com o nome exato da tela.

2.027 testes, 46/46 nos dois runtimes, `tsc` limpo, console limpo.

### v5.3 — Mudado: lote 30: o manual reescrito do zero — 09/09/2026

Pedido do Humberto: *"quero um manual"*. O manual existia, mas tinha sido
remendado vinte e nove vezes: metade das vinte e cinco imagens era de 07/09,
no tema claro, com os painéis no lugar antigo, e vários passos citavam botões
que já tinham mudado de nome. **Reescrito, não remendado.** Só documentação,
mais duas correções de tela que a reescrita achou. Formato, runtime e
conformidade intocados.

- **Oito capítulos novos, na ordem em que se usa o programa**: 01 abrir o
  Recorte · 02 montar o personagem · 03 **peles** · 04 animar · 05 as cinco
  regras · 06 malha e pesos · 07 exportar e usar no jogo · 08 **vindo do
  Spriter**. Peles saiu de dentro do capítulo 2 e virou capítulo: a aba Peles
  é do lote 27 e não tinha lugar próprio no texto.
- **O capítulo 8 é novo.** Uma tabela por assunto — pivô, character map,
  Z-order, key all / key selected, `Alt` + arrastar, action point, collision
  box, entity — com "no Spriter" | "no Recorte" | "onde fica", mais as sete
  teclas que são as mesmas nos dois programas, o que cada um tem e o outro não,
  e o que muda de nome. O antigo capítulo 7 (Spine, DragonBones, Live2D)
  virou seção dele.
- **Cada capítulo abre com "O que você vai conseguir fazer no fim"**, em três
  linhas, e fecha com "O que ainda não funciona". O antigo capítulo 8
  (perguntas) foi para o índice, como "Perguntas que todo mundo faz".
- **Vinte e cinco imagens novas**, todas tiradas na mesma sessão do editor
  rodando: 1440×900, tema escuro, v5.2. Nasceu
  `documentos/notas-de-desenvolvimento/fotos-manual.mjs`, que tira TODAS num
  comando, dirigindo um Chrome headless por CDP. As vinte e cinco antigas
  foram para `backup/manual-imagens_2026-09-09_antes-da-reescrita/`.
- **O manual em inglês acompanha**, em `documentos/manual/en/`: os mesmos oito
  capítulos, as mesmas imagens, cada rótulo em inglês com o português entre
  parênteses.
- **Teste novo, `editor/testes/lote30-manual.test.ts`:** toda imagem citada
  existe no disco; toda imagem no disco é citada; toda imagem tem legenda de
  verdade; e **todo rótulo de botão que o manual cita existe no editor** — a
  lista é lida de `menus.ts`, `toolbar-model.ts` e `action-bar-model.ts`, e
  cada linha tem de estar nos dois lados. Um botão renomeado sem o manual
  reescrito reprova.

**Dois defeitos achados ao fotografar**, os dois de lotes anteriores:

- **As cinco ferramentas de estrutura não sumiam em Animando.** O
  `syncToolModes` marcava `hidden` em Criar osso, Ponto, Caixa, Malha e Pesos
  desde o lote 17, mas `.viewport-button { display: inline-flex }` vence o
  `[hidden] { display: none }` do navegador: os cinco continuavam desenhados e
  clicáveis com uma animação aberta. É o mesmo defeito dos lotes 14 e 16, agora
  na barra de ações. Uma linha de CSS.
- **"Exibir → Réguas" estava cinza desde o lote 21.** A ação `ver-reguas` nunca
  foi registrada e não havia caixa nenhuma no painel Exibição: as réguas
  ficavam ligadas para sempre, sem jeito de desligar. `rulers` entrou em
  `SHOW_ROWS` (que registra a ação) e em `SCENE_ROWS` (que desenha a caixa, no
  grupo "A cena").

2.018 testes, 46/46 nos dois runtimes, `tsc` limpo, console limpo, cena em
69% da altura.

### v3.6 — Mudado: lote 14: a linha do tempo nasce fechada — 09/09/2026

Rodada 3 da interface, "a cara do Spriter". Pedido do Humberto, com a tela do
Spriter Pro aberta ao lado da nossa: *"o Spriter é limpo e claro. A linha do
tempo mostra só a linha principal, e só mostra os detalhes quando você clica
para mostrar os detalhes"*. **Só editor**: formato, runtime e conformidade não
foram tocados.

- **A faixa de baixo nasce fechada**, com três linhas: o tocador, a régua e o
  Resumo. Medido em 1440×900: ela passa de 240px para **121px**, e a cena vai
  de 55% para **68%** da altura da janela.
- **A régua perdeu a linha "quadro N"** e o canto da cebola encolheu — pedido do
  Humberto ao ver a primeira foto: *"se tirar o nome quadro da linha do tempo
  ele pode ficar ainda mais fina"*. O quadro já está no tocador, ao lado do
  tempo, e continua na dica de cada marca. A faixa fechada foi de 136 para
  **121px**, e a cena de 66% para **68%**.
- **Botão Detalhes**, na ponta direita da linha do tocador. Abre as abas
  Linha do tempo · Curvas · Prévia, a linha dos botões em bloco e uma linha por
  osso e por desenho. `aria-expanded` acompanha, e a dica diz o que vai
  aparecer. **Janela → Detalhes da linha do tempo** é a mesma porta.
- **Arrastar a borda de cima** também abre e fecha, como no Spriter: acima de
  176px abre, abaixo fecha. A altura de aberta não se perde ao fechar.
- **Aberta ou fechada fica gravada no arquivo**, em `RECORTE_editor_state.dock`,
  ao lado da arrumação da coluna. Nenhum campo novo no núcleo do formato.
- Nada some: cada botão em bloco continua no menu **Animação**, com a tecla ao
  lado.
- `panels/dock-model.ts` novo, puro, com a conta inteira e 17 testes.
  **1.732 → 1.749 testes.**

### v5.2 — Mudado: lote 29: as funções escondidas — 09/09/2026

Anotação 15 do Humberto: *"aproveite e veja se tem outras funções extremamente
importantes escondidas."* **Só editor**: formato, runtime e conformidade não
foram tocados.

**Nenhuma delas estava escondida do jeito que se esperava: nenhuma faltava num
menu.** Elas eram **gestos sem ação nenhuma registrada** — `Alt` + clique na
régua, `M` com o foco na faixa, botão direito no losango, `Ctrl` + arrastar no
Criar osso. Não havia o que pôr num menu, porque não havia função: havia um
`if` no meio de um manipulador de evento.

| # | O que estava escondido | Onde ele está agora |
|:---:|:---|:---|
| a | **marcar o trecho de laço** (`Alt` + clique na régua) | dois **colchetes** no canto da régua, e **Animação → Trecho de laço**. Só o "tirar" tinha porta: havia como desfazer o que não havia como fazer |
| b | **as marcas** (`M`, `Ctrl+↑`, `Ctrl+↓`) | a **bandeirinha** no canto da régua, e **Animação → Marcas**. Dar nome saiu do `prompt` do navegador e virou janela nossa |
| d | **`Ctrl`** e **`Alt`** ao criar osso | escritos no **rodapé** com a ferramenta na mão, e na dica do botão. Moravam num comentário do código |
| e | **Virar filho de…** exigia clicar num osso na cena | o item do menu abre a **lista de ossos**, com busca. A tecla `P` continua fazendo a mira |
| f | **copiar e colar âncora** | **botão direito na Árvore**, e a palavra "âncora" saiu da tela: agora é **posição no osso**. Ela fica no manual, como sinônimo |
| g | **botão direito no losango** (curva) e **duplo clique** (apagar) | a **dica do losango** diz os dois, e **Animação → Curva da chave** ficou de verdade: os quatro itens estavam **cinzas desde o lote 12**, esperando um lote que já tinha passado |
| i | **Substituir nomes** | também no **botão direito da Árvore** |
| j | a aba **Malha e pesos** sumia sem a ferramenta na mão | ela **fica sempre**, e sem a ferramenta diz *"escolha a ferramenta Malha (M) ou Pesos (G) para editar"*. Uma aba que some é uma função que deixou de existir para quem não sabia dela |
| k | **Novo ▾ → Regra** criava **adivinhando** | os dois caminhos abrem a **janela guiada** do lote 28. Ninguém mais cria regra às cegas |

Mais três, menores: **Shift+Delete** já estava escrita ao lado do item; o
**botão direito na cena** (volta à ferramenta de antes) se explica no rodapé
**na primeira vez** que é usado; e a **imagem de referência** ganhou botão na
barra de ações, num grupo **Exibir** novo — ela é a primeira coisa que se
procura ao montar um personagem em cima de um desenho de papel.

- Nasceu `ui/action-audit.ts`: **`hiddenFunctions`** recebe toda ação que o
  programa registra e devolve as que não têm porta nenhuma. O teste lê a lista
  do **código-fonte**, para ela não poder envelhecer, e espera **lista vazia**.
  A lista de dispensadas carrega o motivo de cada uma, escrito.

2.003 testes (16 novos), `tsc` limpo, 46/46 na conformidade, console limpo,
cena em 69% nos dois modos.

### v5.1 — Acrescentado: lote 28: a aba Regras — 09/09/2026

Anotação 13 do Humberto: *"entendi as 5 regras. Mas não sei como usar, e está
escondido."* **Só editor**: formato, runtime e conformidade não foram tocados,
e **nenhum campo novo** — `bones`, `target` e `mix` já existem na §6.

Estava escondido: as regras eram a última seção da Árvore, abaixo de dezoito
ossos e vinte e três slots. E era **pior do que escondido**: pela tela não dava
para montar uma IK de dois ossos, que é a do próprio exemplo do herói.

| O que havia | O problema |
|:---|:---|
| criar gravava `bones: [primeiro osso]` | cadeia de **um** osso, mesmo com dois escolhidos |
| o alvo era "o primeiro osso do arquivo fora da cadeia" | ninguém perguntou |
| Propriedades não tinha o campo da cadeia | não dava para consertar depois |
| alvo igual a um osso da cadeia | nada impedia, e o manual diz que não pode |
| nome de osso errado | a regra sumia da cena, sem uma palavra |

- **Aba Regras**, na coluna da direita, ao lado de Peles. Uma linha por regra:
  **ícone do tipo** (cinco desenhos diferentes — a cor ajuda, mas quem carrega
  a informação é a forma), **olho**, **nome** com a cadeia e o alvo embaixo
  (`arm → forearm → hand_target`), e a **força numa barra**.
- **O olho desliga com força zero e guarda o valor.** Ligar de volta devolve o
  número que estava lá, e não `1`. A memória é da sessão: nenhum campo novo.
- **Regra torta fica na lista, em vermelho**, dizendo qual nome não existe —
  inclusive a que não tem osso nenhum.
- **Nova regra é uma janela que pergunta**, em duas partes: primeiro o tipo, com
  uma frase do que cada um faz e o exemplo do herói; depois as perguntas daquele
  tipo — *"que ossos dobram?"*, *"que osso eles perseguem?"*, *"dobra para a
  frente?"*. Os ossos escolhidos na cena já entram marcados.
- **A janela não fecha errada**: enquanto falta alguma coisa o botão fica cinza
  e a frase embaixo diz o quê, incluindo *"o alvo não pode ser um dos ossos que
  dobram"*. A ordem pai → filho da cadeia é posta sozinha, pela ordem do
  esqueleto.
- **Propriedades ganhou "Ossos da cadeia"** nos três tipos que têm cadeia. É por
  ele que uma IK de um osso vira uma de dois **depois** de criada.
- **A seção Regras saiu da Árvore**; o osso que tem regra ganhou uma **marca
  laranja** ao lado do nome, para a Árvore continuar dizendo quem se mexe
  sozinho.
- **Posar passou a dizer que não cria regra**: com a ferramenta na mão o rodapé
  diz *"Posar dobra a cadeia agora, sem criar regra. Para o jogo dobrar sozinho,
  crie uma regra de IK."* É a confusão mais cara que havia aqui.
- Nasceu `askGuided` em `ui/dialog.ts`: a janela de perguntas, com escolha,
  caixas e validação que segura o botão. Ela serve qualquer outra janela guiada.
- O menu **Janela** passou a ter **três blocos, pelo que se está fazendo** —
  montar, animar, olhar. Treze nomes numa fila não se leem, e cortar de seis em
  seis dava um corte que não queria dizer nada.

1.987 testes (26 novos), `tsc` limpo, 46/46 na conformidade, console limpo,
cena em 69% nos dois modos.

### v5.0 — Acrescentado: lote 27: a aba Peles — 09/09/2026

Anotação 12 do Humberto: *"não sei onde estão as skins e como faço para usar.
Skin é importante, não deixa escondido."* **Só editor**: formato, runtime e
conformidade não foram tocados.

Ele tinha razão três vezes. A pele morava em **três lugares** e em nenhum deles
inteira: a seção Peles da Árvore mostrava os nomes, o painel Exibição tinha o
"Mostrar" e o "Editar aqui", e o Novo ▾ criava. Quem procura *"onde ligo a
armadura"* não procura no painel da grade, dos eixos e da cebola.

- **Aba Peles**, na coluna da direita, ao lado de Animações e Histórico. Uma
  linha por pele: **olho** (Mostrar), **lápis** (Editar aqui, uma só, em
  laranja), **nome** (duplo clique renomeia) e **quantos slots** ela veste. Em
  cima, três ícones: Nova pele · Duplicar pele · Apagar pele.
- **Duplicar** copia a pele inteira, com os anexos, e a cópia é funda: é assim
  que nasce a segunda armadura, em vez de vinte e três anexos escritos à mão.
- **Renomear** troca o nome também no campo `skin` de cada linha de tempo de
  `deform` e `sequence` (§12.2). Trocar num e não no outro quebrava a animação
  em silêncio.
- **Apagar** leva junto as linhas de tempo que só aquela pele tinha, para o
  arquivo não ficar apontando para o nada. A `default` não sai: ela é o corpo.
- **A seção Peles saiu da Árvore** e **as duas caixas saíram do painel
  Exibição** — regra 5 da casa: uma função, um dono. Os **desenhos** continuam
  na Árvore, agora na seção **Desenhos**, com o slot e a pele ao lado: eles são
  a única porta para escolher um anexo pelo nome, e nada some.
- **Novo ▾ → Pele** continua existindo e chama a mesma ação da aba — ela traz a
  aba à frente antes de criar. Criar uma pele e não ver onde ela foi parar é
  exatamente o que ele reclamou.
- O menu **Janela** foi repartido em **seis e seis**: a aba nova desequilibrou o
  corte de antes, e a auditoria de menus do lote 19 recusa bloco de mais de seis.

1.961 testes (16 novos), `tsc` limpo, 46/46 na conformidade, console limpo,
cena em 69% nos dois modos.

### v4.9 — Mudado: lote 26: a anotação 10 do Humberto, Inclinar e Escalar — 09/09/2026

Ele apontou o botão da ferramenta Inclinar: *"isso é ordem Z? O ícone ficou fora
do padrão. Tentei usar, não entendi."* Eram três defeitos numa coisa só, e os
três se explicam. **Só editor**: formato, runtime e conformidade não foram
tocados.

- **Inclinar ganhou ícone**: o retângulo virado **paralelogramo**, com o topo
  deslocado para a direita e a seta em cima dizendo para onde ele andou. A base
  fica no chão, que é a metade da regra que a palavra "inclinar" não conta.
  **Nunca a letra Z**: a ferramenta tinha a tecla `Z` e nenhum ícone, e o botão
  mostrava a letra — daí a leitura "ordem Z", que é outra coisa.
- **Escalar ganhou o ícone que ele desenhou**: um **L com seta nas duas pontas**,
  uma para cima e uma para a direita, saindo do mesmo canto. O de antes era um
  canto com uma seta na diagonal, e ele leu como "inclinar" — o que é justo:
  uma diagonal é exatamente o que uma inclinação faz.
- **A ordem da barra está escrita**, em `TOOL_ORDER`. Ela era a ordem dos
  `import` no `viewport.ts`: o `shear` se importava antes do `scale`, e a barra
  saía **Girar · Inclinar · Escalar**. Agora é **Escolher · Mover · Girar ·
  Escalar · Inclinar**, que é a ordem do gesto — primeiro escolher, depois as
  quatro que mexem, e só então as que criam. Mover um `import` de lugar não
  muda mais a barra por acidente, e a tira vertical escondida passou a ler a
  mesma lista, para não haver duas ordens.
- **Sem osso, Inclinar passou a dizer por quê.** Ela não fazia nada e não dizia
  nada — desvio 6 do lote 13, e foi nesse silêncio que ele tropeçou. O rodapé
  agora diz *"Inclinar: escolha um osso e arraste. O topo anda, a base fica."*,
  e some assim que um osso é escolhido. A dica do botão diz o mesmo. Mover,
  Girar e Escalar não ganham linha nenhuma: sem osso elas caem no **desenho**,
  e fazem alguma coisa.

### v4.9 — Corrigido: lote 26: o clique na lista de animações, tocando — 09/09/2026

Anotação 16, e ele repetiu a 6 depois da v4.8: *"quando tiver uma animação
rodando, quero poder clicar em outra e ela tocar. Atualmente isso está
travado."*

**Nada estava travado: a lista fugia da mão.** O painel Animações escuta `time`
e refazia a lista inteira a cada aviso. Tocando, o tempo muda a cada quadro, e o
botão em que o dedo descia já tinha sido destruído quando o dedo subia — e o
navegador **não dispara `click`** quando o `mousedown` e o `mouseup` caem em
elementos diferentes. O motor estava certo desde o lote 24.

- Nasceu `panels/list-redraw.ts`, puro: `redrawPlan(kind, antes, agora)`
  responde **nada**, **só-escolha** ou **refazer**. Mudança de tempo com a lista
  igual não encosta no DOM; trocar a animação aberta troca só o `aria-selected`;
  animação nova, apagada, renomeada ou com outra duração refaz.
- Aplicado ao painel **Animações**, que é onde o defeito estava, e à aba
  **Ordem**, onde o aviso frequente é `selection`: escolher um osso na cena
  refazia vinte e três linhas com miniatura e derrubava a rolagem e a pasta
  aberta.
- **Não** se trocou `click` por `mousedown`: isso esconderia a causa e quebraria
  o arrasto.
- Achado por um teste escrito no mesmo lote: a primeira assinatura juntava os
  campos com `|`, e um slot chamado `a|1` colidia com dois campos `a` e `1` —
  duas listas diferentes com a mesma assinatura fariam a tela **deixar de se
  refazer**. Passou a ser `JSON.stringify`.

1.945 testes (22 novos), `tsc` limpo, 46/46 na conformidade, console limpo.

### v4.8 — Mudado: lote 25: as anotações do Humberto, 5, 8, 9, 11 e 14 — 09/09/2026

Cinco pedidos dele, de 09/09/2026, usando o programa. **Só editor**: formato,
runtime e conformidade não foram tocados. Referência de tela: o print
`06-ordem-z_203.jpg` do Spriter, em `documentos/pesquisa/nova pesquisa/spriter/
prints/`.

- **A aba Ordem passou a ser lida de ponta-cabeça** — anotação 8: *"Ordem é de
  cima pra baixo, e você ainda colocou um texto kkkk. Muda isso."* O de cima da
  lista agora fica **na frente**, como no Spriter, no Spine e em todo programa
  de camadas. A frase que explicava o contrário **saiu**, e nada entrou no
  lugar. O array `slots` continua sendo a ordem de desenho (§4.3): o que mudou
  é a leitura. No menu Esqueleto, "Subir/Descer na ordem de desenho" viraram
  **Trazer para a frente** e **Mandar para trás**.
- **Só desenho entra na aba Ordem** — anotação 9, apontando `hitbox`,
  `hand_point` e `cape_path` com a miniatura vazia: *"o que é isso?"*. Entra o
  slot cujo anexo é `region`, `mesh`, `linkedmesh` ou `skeleton`; ficam de fora
  `boundingbox`, `point`, `path` e `clipping`, que continuam na **Árvore**. Um
  desenho que existe só noutra pele fica na lista, apagado: ele tem ordem, só
  não tem imagem agora.
- **Pastas na aba Ordem** — anotação 11: *"eu poderia pôr as peças da capa
  dentro de uma pasta e mover todas de uma vez"*. O `slot.folder` **já existia**
  no formato (§4.3) e já vinha preenchido do importador de PSD; faltava a tela.
  Pasta dobrável com miniatura e contagem; arrastar a pasta ou `Ctrl+↑`/`Ctrl+↓`
  nela move todas as peças **num passo de desfazer só**, mantendo a ordem
  interna; botão direito com **Pôr numa pasta…** (que diz **antes** quantas
  peças mudam de lugar), **Tirar da pasta** e **Renomear**. Pasta com peça de
  fora no meio aparece **quebrada em dois pedaços**, com aviso e **Juntar** —
  porque a ordem de desenho é o array, e mentir sobre isso sairia caro na cena.
  **Nenhum campo novo no formato.**
- **A Prévia saiu da faixa de baixo** e voltou para a coluna da direita, ao lado
  de Imagens e Exibição — anotação 5: *"muda isso de lugar, não faz sentido tá
  aí"*. O desvio 1 do lote 12 a tinha mandado para baixo com o argumento de que
  ela é sobre tempo; a faixa de baixo é a linha do tempo, e uma janelinha do
  personagem não é uma linha de tempo. Arquivo gravado com ela na faixa **não
  perde a Prévia**: ela reaparece na coluna, e a aba ativa da faixa volta a ser
  a Linha do tempo.
- **O tocador repete sempre** — anotação 14: *"quando clico numa animação sem
  laço, ela roda uma vez. Deveria rodar sempre enquanto o play estiver ligado."*
  O modo de fim de fábrica passou a ser **Repetir**, independente do `loop` do
  arquivo. "Como o arquivo diz" continua no ⋯ Mais, e continua sendo o jeito de
  ver o que o **jogo** fará. **Nada muda no arquivo**: o `loop` é do jogo, e o
  selo `repete` da lista de Animações continua mostrando isso.

### v4.8 — Corrigido: três painéis liam o tema errado — 09/09/2026

**Ordem**, **Histórico** e **Imagens** montavam o host sem a classe `painel`,
que é onde os tokens `--painel-*` são definidos. Toda regra da folha escrita
como `var(--painel-x, cor-clara)` caía no valor de **reserva**, que é a cor do
tema claro: miniatura com fundo branco e texto cinza-escuro em cima do escuro.
As três abas nasceram nos lotes 16, 19 e 20; o tema escuro chegou no 18 e virou
o padrão, e ninguém tinha olhado para elas de novo depois disso. Achado ao pôr
o cabeçalho de pasta na aba Ordem, que usa fundo de campo e tornou o defeito
visível.

1.923 testes (22 novos), `tsc` limpo, 46/46 na conformidade, console limpo,
cena em 69% nos dois modos.

### v4.7 — Mudado: lote 24: as anotações do Humberto, 3, 4, 6 e 7 — 09/09/2026

Ele usou o editor depois do lote 23 e apontou dez coisas. Quatro delas são
deste lote, e as quatro são a mesma queixa dita de quatro jeitos: **o programa
faz coisa que ninguém pediu, e não diz o que está fazendo.** **Só editor**:
formato, runtime e conformidade não foram tocados.

- **A faixa de baixo não abre mais sozinha** — anotação 4, nas palavras dele:
  *"não quero que a linha do tempo fique abrindo. Se ela está fechada, não
  devia abrir do nada"*. Agora ela só abre por gesto dele: o botão **Detalhes**,
  a **alça** puxada até `OPEN_MIN`, ou o menu **Janela**. Fecharam-se as quatro
  portas por onde ela abria sozinha:
  - na **partida**, uma aba lembrada Curvas fazia `showDockPanel` abrir a faixa.
    Agora, com a faixa fechada, a aba à frente volta a ser a Linha do tempo;
  - **trocar de modo** Montagem ⇄ Animando abria e fechava a faixa (lote 23).
    Não mexe mais: trocar de modo é trocar de modo;
  - **escolher outra animação** entrava em Animando e abria a faixa junto;
  - a **alça** abria com 40px acima do fechado, que é um esbarrão. Fechada, ela
    agora só abre quando puxada até `OPEN_MIN` (240px). Aberta, continua
    fechando perto do chão, onde o gesto é claramente de fechar.
- **Tocando, trocar de animação segue tocando** — anotação 6: *"quando dou play
  e mudo de animação, ele não troca a animação automaticamente"*. Antes o
  tocador parava. Agora: tocando + escolher outra = continua tocando, a nova, do
  tempo zero; parado + escolher = parado, no tempo zero. **Voltar à montagem**
  continua parando. A conta está em `switchAnimation`, no motor do tocador.
- **O tempo e o quadro escritos na agulha** — anotação 7: *"não sei qual é o
  quadro que eu estou mexendo. Podia estar escrito na barra"*. A agulha ficou
  **grossa e vermelha**, da régua até o fim do Resumo, e ganhou uma
  **bandeirinha** na régua com `0,02 s · q 1`. Perto do fim da régua ela troca
  de lado sozinha. O **campo de tempo** do tocador fica **laranja** quando a
  agulha está em cima de uma chave. O laranja do trecho de laço não mudou.
- **A dica do ⋯ Mais lista o que tem dentro** — anotação 3: ela falava de três
  gestos e calava sobre os outros seis. Agora sai da própria lista de controles,
  então controle novo entra na dica sozinho: *"No fim, esticar, espelhar, fechar
  ciclo, pares de nome, mostrar só os escolhidos, tirar trecho de laço"*.

**A cena em Animando ganhou 30 pontos**, e não porque alguém a aumentou:
porque parou de encolher sem ser chamada. Medido em 1440×900, Chrome headless:
623 px · **69%** nos dois modos, contra 352 px · 39% em Animando no lote 23.

1.901 testes (13 novos), `tsc` limpo, 46/46 na conformidade, console limpo.

### v4.6 — Acrescentado: lote 23: o interruptor de modo, e mais ícones — 09/09/2026

Dois pedidos do Humberto no mesmo dia, depois de a rodada 3 fechar.

**O interruptor de modo**, como o do Spine:

- `Montagem | Animando` na **ponta esquerda da barra**, uma peça de duas
  posições. **Animando fica laranja** — é onde mexer num osso grava chave.
- Tecla **`Ctrl+Tab`**. `Tab` sozinho continua escondendo os painéis.
- **A linha do tempo acompanha**: entrar em Animando abre, voltar para Montagem
  fecha. A altura de aberta não muda, e a faixa aberta à mão em Montagem
  continua aberta — o interruptor só age na troca.
- Sem animação nenhuma, a metade Animando fica cinza e a dica diz o caminho.
- **"Voltar à montagem" saiu do painel Animações.** O item **Animação →
  Montagem ⇄ Animando** ficou, com a tecla ao lado.

**Mais ícones no lugar de palavras**, a pedido dele: *"tem muitos nomes onde
podia ser trocados por ícones, só isso já ganharíamos muito espaço"*.

- Os **sete botões em bloco** da linha do tempo viraram ícones. **Medido: de
  889px para 378px** — 511px de largura devolvidos à folha de chaves.
- A palavra **"Eixos"** saiu da barra: a lista ao lado já mostra a escolha.
- Quatro ícones novos: `key-remove`, `expand-h`, `contract-h`, `mirror-h`.
- Em tudo isso a palavra continua no `title` e no `aria-label`, e volta ao lado
  do ícone com **Editar → Preferências → Mostrar nome das ferramentas**.
- **1.881 → 1.888 testes.**

**O que isso custou, medido:** o interruptor pesa 205px, e a barra passou a
precisar de 1.494px numa janela de 1.440. Ela **rola de lado**, como foi
desenhada para fazer, e a barra de rolagem custa 4px de altura: a cena em
Montagem foi de **70% para 69%**. Está escrito nos Desvios do lote 23, com o
próximo lugar de onde tirar largura.

### v4.4 — Acrescentado: lote 22: a ficha rápida em Propriedades — 09/09/2026

Rodada 3 da interface, **último lote**. É a `Object Properties` do Spriter.

- **Seis linhas, sempre as mesmas, sempre no alto** do painel Propriedades:
  `X` · `Y` · Escala X · Escala Y · **Ângulo com disco** · **Alfa com barra**.
- O painel mostra tudo o que o formato tem, na ordem do formato — e a rotação
  de um osso ficava na terceira seção, abaixo de nome, cor, ícone e
  comprimento. **Nada some**: o resto do painel continua embaixo, inteiro.
- **O disco** grava pelo mesmo caminho do campo de número: mesma `Command`,
  mesmo passo de desfazer, e em **Animando** ele cria chave como o campo cria.
  Direita 0, cima 90, esquerda 180, baixo −90, com Y para cima (§4.2).
- **A barra do alfa** vai de 0 a 100 e grava de 0 a 1, presa nos limites: o
  formato não tem alfa 1,5.
- Um **osso não tem alfa**: a linha fica **vazia**, com o nome, e a dica diz por
  quê — vazia, e não cinza, que é o desvio 2 do lote 12.
- A coluna da esquerda passou a nascer meio a meio, para as seis linhas caberem
  sem rolar em 1440×900.
- `panels/quick-model.ts` novo, puro. **1.863 → 1.881 testes.**

### v4.3 — Acrescentado: lote 21: réguas na cena — 09/09/2026

Rodada 3 da interface. **Só editor.**

- **Réguas com números**, em cima e à esquerda, como no Spriter. Padrão
  ligado; **Exibir → Réguas** desliga, e a escolha fica gravada.
- **Régua e grade nunca discordam**: as duas saem do mesmo `gridStep`. Os
  números caem exatamente em cima das linhas da grade, e o `0` em cima do eixo.
- Uma **marca fina a cada quinto** entre os números, e uma **linha laranja**
  acompanhando o ponteiro nas duas réguas.
- **Barras de rolagem não entram**, e está escrito para não voltarem: a cena é
  infinita, e `Espaço` + arrastar já move.
- `viewport/rulers.ts` novo, puro. **1.852 → 1.863 testes.**

### v4.2 — Acrescentado: lote 20: o painel Imagens — 09/09/2026

Rodada 3 da interface. **Só editor.** É a `Palette` do Spriter, e é a última
das "coisas básicas que o Spriter tem" que nós não tínhamos.

- **Painel Imagens**, novo, no alto da coluna da direita: todas as regiões do
  atlas em grade, **miniatura de 48px**, o nome embaixo, e um número dizendo
  quantos slots usam cada uma. Zero é a imagem que ninguém está usando.
- **Caixa de busca**, filtrando ao digitar, **sem acento e sem caixa**: `MAO`
  acha `mão_fechada`.
- **Arrastar uma imagem para a cena cria o desenho ali**: um slot novo, com
  aquele desenho, no osso escolhido (ou na raiz), na posição em que caiu. Uma
  cruz laranja mostra onde vai cair enquanto o dedo não solta. **Um passo de
  desfazer**, e ele devolve o arquivo letra por letra.
- Antes deste lote isso eram três passos — criar slot, criar anexo, escolher a
  região numa lista de nomes — e em nenhum deles a imagem aparecia antes de ser
  escolhida.
- `panels/palette-model.ts` e `panels/palette.ts` novos. A cena responde a **um**
  tipo de arrasto e a mais nada. **1.834 → 1.852 testes.**

### v4.2 — Corrigido: um anexo nulo derrubava o painel Imagens — 09/09/2026

Achado na primeira montagem do lote. `null` é como o formato diz "esta pele
esconde este slot" (§7.1), e a conta de usos lia `path` dele. O erro derrubava
a montagem inteira dos painéis, e os que vinham depois ficavam com a tela da
montagem anterior — sem erro visível na tela, o que é pior.

### v4.1 — Mudado: lote 19: painéis limpos, menus auditados, Histórico — 09/09/2026

Rodada 3 da interface. **Só editor.** É a segunda reclamação do Humberto:
*"nossos menus são muito bagunçados e não temos coisas básicas que o Spriter
tem"*.

- **O cabeçalho da Árvore virou uma linha.** Eram oito botões de palavra em
  três linhas, e as três empurravam o título "Ossos 18" para fora da vista —
  o terceiro defeito da tela que ele mandou. Agora são três: **＋ Novo ▾**, que
  abre a lista de Osso · Slot · Regra ▸ · Evento · Pele · Parâmetro, **Apagar**
  e **Buscar**. Medido: a Árvore passa de 4 para 7 linhas à vista.
- **Animações virou uma linha de cinco ícones.** A palavra volta com **Editar →
  Preferências → Mostrar nome das ferramentas**, e continua no `title` sempre.
- **Painel Histórico**, novo, ao lado de Animações — a aba `History` do
  Spriter. Uma linha por passo, com o nome que a `Command` já carrega. Clicar
  numa linha volta **ou avança** até ela, e a barra de baixo diz quantos passos
  andou. Os desfeitos ficam cinza até serem sobrescritos.
- **Os sete menus passaram por auditoria.** Nenhuma ação em dois menus, nenhum
  nome com mais de 28 letras, e nenhum menu comprido com um bloco de mais de
  seis itens entre separadores. Foram **28 problemas achados e fechados**:
  quatro nomes longos e seis blocos sem degrau, no Arquivo, no Exibir, na
  Animação e na Janela.
- `ui/menu-audit.ts` e `panels/history-model.ts` novos, puros. A pilha de
  desfazer ganhou `entries()` e `cursor()`, **só de leitura**: nenhum painel
  pode pegar um `Command` e aplicá-lo fora de ordem.
- **1.818 → 1.834 testes.**

### v4.0 — Mudado: lote 18: o tema escuro, e ele é o padrão — 09/09/2026

Rodada 3 da interface. **Só editor.** As cores da tela do Spriter: painel cinza
escuro, texto claro, cena cinza claro, laranja no que está ligado.

- **O editor abre no escuro.** O claro continua inteiro em **Exibir → Tema →
  Claro · Escuro**, e a escolha fica gravada no navegador — é preferência de
  quem usa, e não do arquivo.
- **A cena continua CLARA no tema escuro**, como no Spriter. O personagem é
  desenhado com linha escura, e linha escura sobre fundo escuro não se vê.
- **Trocar de tema não remonta nada**: são variáveis escritas na raiz do
  documento. O campo que estava sendo digitado continua sendo digitado.
- **Toda cor passou pela conta do WCAG.** Texto sobre painel, texto sobre
  fundo, texto do botão aceso e o do aviso: todos em **4,5 ou mais** nos dois
  temas. Nenhuma cor entrou por parecer bonita numa foto.
- **A cena aprendeu a trocar de cor.** As doze cores dela viviam presas num
  objeto dentro do `viewport.ts`, e ela era a única parte do programa que não
  sabia mudar de tema.
- `ui/theme.ts` novo, puro. **1.803 → 1.821 testes.**

### v4.0 — Corrigido: os quatro botões acendiam transparentes no tema escuro — 09/09/2026

Achado ao ligar o tema. O laranja era declarado dentro do próprio bloco dos
botões, e o lote 18 o transformou em `--toggle-on: var(--toggle-on, …)` — uma
variável que se define por si mesma, que o navegador trata como valor inválido.
Os quatro acendiam **transparentes**, e ninguém vê um botão transparente aceso.
O laranja passou a morar num lugar só: o `:root` e os dois temas.

### v3.9 — Acrescentado: lote 17: a barra de ações e os quatro botões — 09/09/2026

Rodada 3 da interface. **Só editor.** É a primeira reclamação do Humberto, com
a tela do Spriter aberta ao lado da nossa: *"**Observe que não temos isso**"*,
apontando para `Show Bones · Lock Bones · Show Sprites · Lock Sprites`.

- **Os quatro botões existem**, em **texto**, com fundo **laranja** quando
  ligados: **Ver ossos (7) · Travar ossos (8) · Ver desenhos (9) · Travar
  desenhos (0)**. "Ver ossos" e "Ver desenhos" só existiam dentro do menu
  Exibir; os dois cadeados eram ícone. A cor nunca vai sozinha: `aria-pressed`
  acompanha e a dica diz o que o botão faz.
- **Uma barra só**, na ordem do Spriter: **Arquivo** (Novo · Abrir · Salvar) ·
  **Editar** (Desfazer · Refazer · Recortar · Copiar · Colar · Apagar) ·
  **Ferramentas** · **Eixos** · **Ver e travar**. Traço fino entre os grupos.
- **Ela atravessa a janela inteira**, logo abaixo do menu, como no Spriter.
  Presa dentro da cena, entre as duas colunas, tinha 904px numa janela de 1440.
- **Uma linha, sempre**: `flex-wrap: nowrap` e rolagem lateral. Medido em
  1440×900: **44px de altura**, contra os 48 que o plano pedia como teto.
- **Desfazer e Refazer ficam cinza** quando não há passo, e a dica diz por quê.
- **Nove ícones novos**, desenhados aqui: `new`, `open`, `save`, `undo`, `redo`,
  `cut`, `copy`, `paste`, `trash`. Nada de CDN.
- `ui/action-bar-model.ts` novo, puro, com a lista inteira e uma auditoria que
  confere que todo botão tem nome, dica, ícone que existe e ação que existe.
  **1.786 → 1.806 testes.**

**A meta da rodada bateu.** Medido no Chrome headless, 1440×900, com a linha do
tempo fechada: a cena tem **70% da altura** e **63% da largura** da janela. O
ponto de partida, na tela que o Humberto mandou, era **43%**.

### v3.8 — Mudado: lote 16: duas colunas laterais e a aba Ordem — 09/09/2026

Rodada 3 da interface. **Só editor.** *"Ele usa as laterais, por isso a cena é
muito mais espaçosa."*

- **A cena fica no meio, com uma coluna de cada lado.** À esquerda o que diz o
  que a coisa é — **Árvore · Ordem** em cima, **Propriedades** embaixo. À
  direita o que diz o que se vai fazer — **Exibição** em cima, **Animações ·
  Malha** embaixo. Medido em 1440×900: a cena passa a ter **63% da largura** da
  janela, e continua com 68% da altura.
- **Aba Ordem**, nova: a ordem de desenho sozinha, lista plana, **miniatura de
  40px** (era 24, dentro da Árvore), o nome do desenho ao lado. Arrastar
  reordena; `Ctrl+↑` e `Ctrl+↓` sobem e descem um. Tudo pela mesma `MoveSlot`,
  com o mesmo passo de desfazer.
- **Esqueleto → Subir/Descer na ordem de desenho** (`+` e `−`) deixaram de ser
  itens cinza.
- **Largura de cada coluna arrastável**, 180 a 480px, gravada no arquivo.
- **Botão direito numa aba: mover para a outra coluna.** O mesmo em
  **Janela → Mover painel para a outra coluna**.
- **Migração sem perda**: o `RECORTE_editor_state` de todo arquivo gravado até a
  v3.7 guarda uma coluna só; ela vira a da **direita**, que é onde estava na
  tela, e a esquerda nasce de fábrica com a aba Ordem.
- **1.764 → 1.786 testes.**

### v3.8 — Corrigido: dois defeitos de tela achados pelo lote 16 — 09/09/2026

- **`hidden` não escondia painel nenhum que declarasse o próprio `display`.**
  Um painel que põe uma classe no próprio host e escreve `display: flex` passava
  por cima do `[hidden]` do navegador, e dois painéis apareciam na mesma casa,
  um por cima do outro. É o mesmo defeito da tela do Humberto — o aviso da Malha
  dentro de Animações, o "MOSTRAR NA TELA" embaixo dos botões. Agora
  `.panel-body[hidden]` e `.dock-panel[hidden]` ganham de qualquer classe.
- **A tabela "Mostrar na tela" nunca teve CSS.** O código monta as quatro
  colunas desde o lote 12, mas sem regra nenhuma os campos saíam em fila e o
  cabeçalho lia-se "VerTravarNomeOssos". Agora é uma grade de verdade.

### v3.7 — Mudado: lote 15: o tocador como o do Spriter — 09/09/2026

Rodada 3 da interface. **Só editor.**

- **Barra de velocidade** de 10 a 200 com o número ao lado, no lugar da lista de
  quatro escolhas. A barra e o número escrevem no mesmo `transport.setSpeed`,
  pela mesma conta de `speedFromSlider`. Agora dá para tocar a 30% para conferir
  um contato, que é o uso que existe.
- **Tempo e duração, os dois para digitar**: `0,38 s · quadro 11 / 1,00 s`. A
  duração era um botão que abria uma janela; virou campo. Digitar muda **só o
  número**, num passo de desfazer.
- **Animação → Mudar duração…** deixou de ser um item cinza: é a porta que
  **pergunta** se as chaves esticam junto. As duas chamam o mesmo `setDuration`.
- **Chavear** (`K`) e **Chavear tudo** (`Ctrl+K`) viraram dois botões **com a
  palavra escrita**, como o "key selected · key all" do Spriter. Em Montagem
  ficam cinza e a dica diz por quê.
- **O modo de fim** saiu da linha e foi para o **⋯ Mais**, que passou a morar na
  linha 1, ao lado do Detalhes — ele precisa existir com a faixa fechada.
- **A faixa de baixo atravessa a janela inteira**, por baixo da coluna, como no
  Spriter. Presa entre a barra de ferramentas e a coluna ela tinha 888px numa
  janela de 1440, e a linha nova precisa de 929. A cena não perdeu altura:
  continua em **68%**.
- **1.749 → 1.764 testes.**

### v3.6 — Corrigido: o menu ⋯ Mais nunca esteve escondido — 09/09/2026

Defeito de antes do lote 14, achado por ele. O `hidden` era escrito no elemento
e a regra de autor `display: flex` passava por cima do `[hidden]` do navegador:
a caixa dos oito controles do **⋯ Mais** continuava desenhada em cima da cena e
continuava recebendo clique. Ela aparecia como uma caixa branca solta com
"Tirar trecho de laço" escrito. O mesmo valia para a barra dos botões em bloco.

### Acrescentado — lote socket: encaixe por nome, contrato de rig, animação e skin externas (09/09/2026)

Recorte de decisões do Humberto de 09/09/2026. **Só formato**: spec, schema,
exemplos e casos. Runtime e editor vêm no lote seguinte. Versões v3.1 a v3.4.

- **Socket** (§7.9, §7.11): o pai publica `point.socket` (`"mao_direita"`), o
  filho diz `skeleton.socket` e `childSocket` (`"empunhadura"`), e o encaixe é
  nome com nome. Qualquer arma serve em qualquer personagem que publique o
  socket. Sem campo novo no esqueleto: o `point` já tinha posição, rotação,
  osso, skin e canal no dump.
- **Dois canais do filho** (§7.11): `inheritAnimation` responde ao pai pelo nome
  da animação; `baseAnimation` roda solto, em laço, por baixo de tudo. A pose do
  filho sai em duas camadas, ordem fixa, alpha 1 — a única mistura obrigatória
  da spec. Tabela de precedência: chave `nested` › `inheritAnimation` ›
  `animation` › setup.
- **Contrato de rig** (§4.8 nova): o bloco `rig { name, bones, slots, sockets }`
  diz o que o arquivo exige de quem o usa. Um só bloco para os três usos:
  biblioteca de animação, skin externa, arma que exige socket. Não atendido é
  L2 `RIG_UNMET`: o arquivo abre e diz o que falta.
- **Animações e skins de fora** (§2.8): `assets.animations[]` e
  `assets.skins[]` trazem, pelo nome, as animações e skins de outro `.bone`.
  Local ganha de externa (L2 `EXTERNAL_DUPLICATE`). Sem encadeamento (L1
  `EXTERNAL_CHAIN`).
- Schema: `rig` nova, dois arrays em `assets`, um campo em `attachmentPoint`,
  quatro em `attachmentSkeleton`. Validador da web recompilado.
- Exemplos: `heroi.bone` publica `mao_direita` (inerte); `espada.bone` publica
  `empunhadura` e ganha `attack`; nascem `mecha.bone`, `mecha-animacoes.bone` e
  `mecha-pele-inverno.bone`.
- **Vale para qualquer slot, não só arma** (§7.11, §2.8): a primeira frase da
  §7.11 passa a dizer com todas as letras que a cabeça vira um capacete
  animado, a mochila um jetpack, um braço um braço mecânico; a troca é **por
  skin**, e a skin pode vir de outro arquivo. Exemplo novo `capacete.bone`: um
  capacete com dois ossos, quatro slots e duas animações (`falar`, `piscar`),
  que entra no slot `head` de quem publicar o socket `cabeca`. O `mecha.bone`
  publica `cabeca`, o `mecha-animacoes.bone` ganha `falar`, e a pele
  `mecha-pele-inverno.bone` troca a cabeça pelo capacete, vindo de fora.
- Apêndice A, decisões 62 a 66. Apêndice B, pontos 10 a 12. Códigos novos na
  §12.3: `SOCKET_MISSING`, `SOCKET_MISSING_CHILD`, `SOCKET_DUPLICATE`,
  `NESTED_ANIMATION_MISSING`, `RIG_UNMET`, `RIG_INCOMPLETE`, `EXTERNAL_CHAIN`,
  `EXTERNAL_DUPLICATE`.

### Acrescentado — lote 13 da rodada 2: inclinar e curvas (08/09/2026)

Itens 11, 25, 26, 27, 31, 33 e 21 da pesquisa de interface. **Último lote da
rodada 2.**

- **Ferramenta Inclinar** (`Z`, item 21): arrastar inclina `bone.shearX` e
  `bone.shearY` (§4.2), com alças próprias. É o que faz um retângulo virar um
  paralelogramo — o agachamento que esmaga o peito, o vento que deita a copa da
  árvore. Os dois campos já eram animáveis; faltava a mão, e Chavear passou a
  gravá-los: as chaves se chamam "Inclinação X" e "Inclinação Y". `Shift`
  encaixa de 15 em 15, `Alt` prende num eixo. Molde: `rotate.ts`.
- **Interpolação pelo botão direito no losango** (item 26): Linear · Suave ·
  Parada · Curva…, com marca no que a chave tem hoje, e valendo para todas as
  chaves escolhidas de uma vez. "Suave" é a Bézier de 9.3 em coordenadas
  absolutas, calculada por `smoothCurve` — o formato não tem a palavra "suave",
  e escrevê-la faria uma string desconhecida virar `linear` no jogo.
- **Mudar a duração perguntando** (item 11): a duração no tocador virou botão. Ao
  confirmar um valor novo ele pergunta **"Esticar as chaves junto?"**. Sem
  esticar, a barra diz quantas chaves ficaram depois do fim — contadas ANTES da
  mudança.
- **Esticar puxando a ponta** (item 27): a seleção de chaves ganhou duas barras
  na linha do Resumo; puxar uma estica com a outra ponta parada. Passa pelo
  mesmo `scaleKeys` do campo Fator, e o arrasto inteiro é um passo de desfazer.
- **`Shift+↑` e `Shift+↓` pulam só pelas chaves das linhas escolhidas** (item
  25). Sem linha escolhida, andam por todas — melhor que a tecla parecer
  quebrada.
- **Copiar e colar a âncora do desenho** (item 33), no menu Editar: os cinco
  números que dizem onde o desenho fica dentro do osso. Copiar de uma mão e colar
  em cinco alinha as cinco num passo de desfazer só. O desfazer guarda **quais
  campos não existiam** e os apaga de volta: devolver `rotation: 0` onde não
  havia campo deixaria o arquivo diferente do que era.
- **Colar em todas as chaves** (item 31) já tinha sido entregue no lote 10, junto
  com o item 86, que é o mesmo gesto. Um teste novo confere que ninguém o
  desligou no caminho.
- **32 testes novos** (`editor/testes/lote13-inclinar-e-curvas.test.ts`). Total:
  1.700 → 1.732.

### Mudado — lote 12 da rodada 2: abas e Tab (08/09/2026)

Itens 19, 20, 28 e 30 da pesquisa de interface.

- **A coluna da direita virou dois grupos de abas** (item 19). Eram seis painéis
  empilhados com título dobrável; numa janela de 900px cabiam três abertos, e os
  outros três viravam "não existe". Num grupo de abas só uma aparece por vez e
  ela leva a altura inteira do grupo. **Abas arrastáveis entre os grupos**, e uma
  **alça** entre eles para a divisão de altura (setas também). A arrumação fica
  em `RECORTE_editor_state.panels`, no arquivo — a bancada de montar não é a de
  animar. A conta é pura, em `ui/panel-groups.ts`.
- **`Tab` esconde a coluna e a faixa de baixo** (item 19). **Medido no Chrome
  headless: a cena passa de 55% para 82% da altura da janela, e volta.** É o
  `F9` do Spine e o `Tab` do Blender. Também está em Janela → Esconder painéis,
  com marca. **Janela → Voltar ao padrão** desfaz qualquer arrumação.
- **Nada mais nasce dobrado.** Dobrar era a resposta certa para o problema
  errado: o que faltava não era esconder painel, era dar altura ao que está à
  frente. `CLOSED_PANELS` ficou vazia, e não apagada, para a decisão anterior
  continuar visível.
- **"Malha e pesos" só aparece com a ferramenta de malha ou de pesos na mão**
  (item 19).
- **Exibição em três colunas: ver · travar · nome** (item 20). Um tipo por
  linha. Onde a caixa não existe, a célula fica VAZIA. Três interruptores novos
  que desenham mesmo: `slotNames`, `pointNames` e `boxNames`.
- **A casca de cebola foi para a régua da linha do tempo** (item 28): o ícone
  liga e desliga, o ⋯ ao lado abre os oito campos — os mesmos de antes, pelas
  mesmas funções, agora em `panels/dom.ts`. O painel Exibição perdeu a seção.
- **A Prévia virou aba da faixa de baixo** (item 30), ao lado de Curvas. Ela é
  sobre tempo, e estava na coluna, dobrada, a uma tela de distância da linha do
  tempo que se estava ajustando.
- **29 testes novos** (`editor/testes/lote12-abas-e-tab.test.ts`). Total:
  1.671 → 1.700.

### Acrescentado — lote 11 da rodada 2: arquivo e ajuda (08/09/2026)

Itens 103, 105, 106, 110, 114, 102 e 62 da pesquisa de interface.

- **Paleta de comandos** (`Ctrl+Shift+P`, item 110): digita, filtra, `Enter`
  roda. A busca é sobre `allMenus` — a MESMA lista que desenha os menus —, então
  um comando novo aparece nela no dia em que aparece no menu, sem cadastro.
  Ignora acento e maiúscula, e a ordem das palavras não importa. Mostra a tecla
  ao lado, porque quem procura duas vezes devia estar usando a tecla.
  `ui/palette.ts` (puro) e `askPick` em `ui/dialog.ts` (a janela).
- **A barra muda com o modo** (item 114): Criar osso, Ponto, Caixa, Malha e
  Pesos somem enquanto há animação aberta. `Tool.modes` no contrato,
  `toolsForMode` puro. Somem em vez de ficarem cinzas: botão cinza que nunca
  acende é botão que se aprende a ignorar.
- **Repetir a última exportação** (`Ctrl+Shift+E`, item 103): as opções de
  imagem, glTF e pele ficam no navegador (`io/last-export.ts`) e a repetição não
  pergunta nada. Sem nada guardado, abre a janela normal — nunca adivinha.
- **Reabrir o fechado** (item 105): o rascunho já era gravado a cada três
  segundos desde sempre; o que faltava era a porta. Pergunta antes, com a hora
  do que guardou escrita na pergunta.
- **Configurações do projeto…** (item 106): quadros por segundo (vai no
  ARQUIVO, pelo mesmo campo do painel Propriedades), cor de fundo e densidade da
  grade (vão nas opções de ver). `ViewSettings.gridPixels` é novo, com padrão 48.
- **Prévia em tela cheia** (`F11` na Prévia, item 102): `requestFullscreen` na
  caixa do palco, `Esc` volta.
- **Imagem de referência** (item 62): um PNG atrás da grade, com posição, escala
  e opacidade. A IMAGEM vai para o IndexedDB do navegador (`io/idb.ts`, três
  funções); só a POSIÇÃO vai para `RECORTE_editor_state.reference`. Quem receber
  o `.bone` não recebe junto a fotografia que serviu de guia, nem o peso dela.
- **34 testes novos** (`editor/testes/lote11-arquivo-e-ajuda.test.ts`). Total:
  1.637 → 1.671.

### Acrescentado — lote 10 da rodada 2: chaves em bloco (08/09/2026)

Itens 84 a 91 da pesquisa de interface.

- **Copiar a pose inteira** (`Ctrl+Shift+C`, item 85): pega o valor de TODA linha
  da animação naquele instante, interpolado quando não há chave ali, e cola em
  qualquer animação com `Ctrl+V`. `poseAt` deixa o evento de fora: um evento
  acontece ou não acontece, e copiar a pose não pode inventar um disparo.
- **Colar em todas as chaves** (`Ctrl+Shift+V`, itens 86 e 31): escreve o valor
  copiado em toda chave da linha, sem mexer no tempo de nada.
- **Apagar as linhas do tempo** (`Shift+Delete`, item 87): tira a propriedade da
  animação, e não uma chave. Depois disso o osso segue a pose de repouso ali.
- **Limpar a animação inteira** (item 88), no menu Animação, com **pergunta** e o
  número de linhas escrito no botão.
- **`Ctrl` + arrastar empurra as seguintes** (item 89). `Alt` continua sendo "sem
  encaixe no quadro", e é por isso que o ripple é `Ctrl`. Só as linhas das
  chaves escolhidas andam.
- **Duplo clique num losango apaga** aquela chave (item 90).
- **`Ctrl+X` recorta** (item 91) e **`Ctrl+K` chaveia tudo** (item 84) — todo
  osso e todo slot, inclusive os que ainda não têm linha.
- **Cinco funções novas em `anim/keying.ts`**, todas puras: `poseAt`,
  `pasteToAllKeys`, `removeTimelines`, `clearAnimation` e `rippleMove`. Cada
  gesto é um `EditKeys`, ou seja, um passo de desfazer.
- **Manual** nas duas línguas: capítulo 3 ganhou "Chaves em bloco".
- **18 testes novos** (`editor/testes/lote10-chaves-em-bloco.test.ts`). Total:
  1.619 → 1.637.

### Acrescentado — lote 9 da rodada 2: laço e marcas (08/09/2026)

Itens 81, 82, 100, 93 e 95 da pesquisa de interface.

- **Trecho de laço** (item 81): `Alt` + clique na régua marca o começo, `Alt` +
  clique direito marca o fim. Uma faixa sombreada aparece, e tocar repete só
  ela. A agulha fora do trecho **entra nele** antes de andar. "Tirar trecho de
  laço" está no ⋯ Mais.
- **Marcas** (item 82): `M` põe e tira uma marca no tempo atual, `Ctrl+↑` e
  `Ctrl+↓` pulam de marca em marca, duplo clique no triângulo dá nome. `M` só
  vale com a Linha do tempo em foco — na cena ele continua sendo a ferramenta
  Malha, e uma tecla é atendida uma vez.
- **`anim/markers.ts`, novo:** `addMarker`, `removeMarker`, `renameMarker`,
  `nextMarker`, `previousMarker`, e o ler-e-escrever de
  `RECORTE_editor_state.timeline`. Duas marcas no mesmo instante não existem: a
  segunda troca o nome da primeira, porque dois triângulos exatamente por cima
  um do outro não dão para pegar.
- **Modos de fim** (item 100): uma lista no tocador — Como o arquivo diz ·
  Parar · Repetir · Vai e volta · Voltar ao início. É **jeito de olhar**, de
  sessão: o que o jogo faz continua sendo o `Repetir` da animação.
- **`landAt` em `transport.ts`:** a conta do fim, pura, onde os quatro modos e o
  trecho viram uma coisa só. Dá para conferir os dois sem esperar relógio.
- **`Shift+←` e `Shift+→` pulam dez quadros** (item 93).
- **"Mostrar só os escolhidos"** no ⋯ Mais (item 95): a folha fica com as linhas
  do que está escolhido. A **linha Resumo continua inteira** — ela é o mapa, e um
  mapa filtrado não serve para achar o caminho.
- **Nada disto vai para o jogo:** trecho e marcas moram em
  `RECORTE_editor_state.timeline`, por animação, e os leitores ignoram. Uma
  animação que fica sem marca e sem trecho **sai** do objeto, em vez de deixar
  um resto vazio que cresce a cada sessão.
- **Manual** nas duas línguas: capítulo 3 ganhou cinco seções novas.
- **31 testes novos** (`editor/testes/lote9-laco-e-marcas.test.ts`), e dois
  antigos acompanharam o controle novo do tocador e os dois itens novos do
  ⋯ Mais. Total: 1.588 → 1.619.

### Acrescentado — lote 8 da rodada 2: montar mais rápido (08/09/2026)

Itens 66, 67, 72, 73, 75, 53 e 56 da pesquisa de interface.

- **`Ctrl` + arrastar com Criar osso** cria o osso **e prende nele** o desenho
  escolhido, num passo de desfazer só. É o caminho de montagem mais comum —
  imagem, osso, prender — virando um gesto.
- **`Alt` + arrastar redesenha** o osso escolhido: posição, ângulo e
  comprimento, **sem apagar o que já foi animado com ele**. Os filhos ficam
  parados no lugar do mundo. `redrawPlan` é pura, e é ela que faz a conta.
- **`Ctrl+1` e `Ctrl+Shift+1` voltam à pose de repouso.** Em Animando isso grava
  uma chave com o valor da montagem — não apaga a chave, que deixaria o osso
  seguindo a anterior. Em Montagem não faz nada e diz por quê. Grava mesmo com
  "Gravar sozinho" desligado, como o Chavear: é um comando pedido, não um
  arrasto sendo gravado sozinho.
- **Editar → Substituir nomes…** troca um pedaço do nome em ossos, slots e
  regras de uma vez, e em tudo o que os cita. A janela **mostra antes** quantos
  mudam, quais, e o que será **pulado** com o motivo — um nome que colidiria
  juntaria dois ossos num só. `renameMany` é pura; `RenameMany` aplica num passo
  e desfaz **de trás para frente**.
- **Miniaturas de 24 px** ao lado de cada desenho na Árvore, e do desenho
  escolhido no campo "Anexo". `hand_open` e `hand_fist` são dois nomes que
  ninguém distingue de cabeça. Recorte do atlas, guardado por nome.
- **As setas andam 1 px** com o foco na cena, `Shift` anda 10. Na Linha do tempo
  elas continuam andando no tempo: uma tecla é atendida uma vez.
- **`Ctrl+Shift+I` inverte a seleção.** Travado e escondido ficam de fora:
  escolher o que não pega clique é escolher o que não dá para mexer.
- **`askForm` em `ui/dialog.ts`:** uma janela de campos com prévia ao vivo. Ela
  existe porque uma troca em bloco é rápida e é irreversível de cabeça.
- **Manual** nas duas línguas: capítulo 2 ganhou "Os caminhos curtos", "As setas
  andam 1 pixel", "Substituir nomes", "Inverter a seleção" e "Miniaturas";
  capítulo 3 ganhou "Voltar à pose de repouso".
- **28 testes novos** (`editor/testes/lote8-montar.test.ts`). Total: 1.560 →
  1.588.

### Acrescentado — lote 7 da rodada 2: ver e travar um a um (08/09/2026)

Itens 57, 58, 61 e 59 da pesquisa de interface.

- **Esconder um a um.** `H` esconde o escolhido, `Shift+H` esconde todo o resto,
  `Ctrl+Alt+3` mostra tudo. Na Árvore, cada osso e cada slot ganhou um **olho**
  ao lado do cadeado.
- **Escondido é diferente de travado**, e o editor trata os dois assim: travado
  **aparece** e não pega clique; escondido **não aparece** e também não pega. As
  duas perguntas são diferentes — "não quero esbarrar nisto" e "isto está na
  frente do que eu preciso ver".
- **`Shift+H` deixa os ancestrais à vista.** Um osso escondido cujo filho
  aparece deixaria o filho pendurado no nada, e a hierarquia é justamente o que
  se está olhando quando se pede "só este".
- **Travar o escolhido (`Ctrl+2`), travar o resto (`Ctrl+Shift+2`) e destravar
  tudo (`Ctrl+Alt+2`)** deixaram de ser cinza no menu Esqueleto.
- **"Ver só o resultado" (`Ctrl+Shift+H`)** desliga os dez interruptores de
  desenho auxiliar de uma vez e **guarda como estavam**; apertar de novo devolve
  campo a campo. Guarda só os dez que ele mexe, e não o `view` inteiro: devolver
  o todo desfaria também o que a pessoa mudou de propósito no meio.
- **Nome ao passar o mouse** (item 59): uma caixa no painel Exibição. A etiqueta
  aparece com o ponteiro **parado** por 300 ms — o mesmo tempo de um `title` do
  navegador —, e some assim que ele anda. Desenhada no canvas, sem DOM novo.
- **Tudo isso mora em `RECORTE_editor_state.view`**, como as travas: nada disso
  vai para o runtime. Um `view` gravado antes deste lote não quebra — os campos
  novos voltam vazios.
- **Manual** nas duas línguas: capítulo 2 ganhou "Esconder, e ver só o
  resultado" e "Nome ao passar o mouse".
- **23 testes novos** (`editor/testes/lote7-ver-e-travar.test.ts`). Total: 1.537
  → 1.560.

### Acrescentado — lote 6 da rodada 2: máscara e mover o desenho (08/09/2026)

Itens 47, 48 e 2 da pesquisa de interface.

- **Máscara (`clipping`, §7.7).** Esqueleto → Novo → Máscara cria um polígono de
  quatro cantos que recorta o que estiver fora dele. Nenhum desenho é apagado.
  Ela nasce **na frente da ordem de desenho** — uma máscara recorta do slot dela
  em diante, e criada no fim não alcançaria nada — e com `end` no último slot
  que existia, que é o "recorta tudo" que se espera.
- **Campos da máscara:** "Recorta até", "Só estes" e "Inverter". "Só estes" é um
  tipo de campo novo, `checklist`: uma lista de caixas cujo valor é um array de
  nomes. Nenhuma marcada **tira** o campo do arquivo em vez de gravar `[]`,
  porque em §7.7 as duas coisas querem dizer coisas diferentes.
- **"Usar a silhueta de…"** copia o contorno de um desenho para a máscara, com o
  mesmo traçado que a ferramenta Malha usa. Um comando, um passo de desfazer.
  Contorno com menos de três cantos é recusado por escrito: §7.7 pede três.
- **Caixa "Máscaras" no painel Exibição** e no menu Exibir. Elas aparecem
  tracejadas, em cor própria — sólidas seriam confundidas com a caixa de
  colisão. Um `view` gravado antes deste lote não quebra: o campo volta no
  padrão.
- **Mover o desenho sem mover o osso (item 2).** Com **um desenho escolhido e
  nenhum osso**, Mover, Girar e Escalar passam a escrever `x`, `y`, `rotation`,
  `scaleX` e `scaleY` do **anexo**, no espaço do osso. Uma cruz marca a âncora.
  Com um osso escolhido, as três voltam a mexer no osso.
- **Também é montagem:** o formato não tem linha do tempo para a posição de um
  `region`. A barra de baixo diz isso uma vez por arrasto.
- **Manual** nas duas línguas: capítulo 2 ganhou "Máscara: esconder sem apagar" e
  "Mover o desenho sem mover o osso".
- **19 testes novos** (`editor/testes/lote6-mascara-e-desenho.test.ts`), e um
  teste antigo do painel Exibição acompanhou a caixa nova. Total: 1.518 → 1.537.

### Acrescentado — lote 5 da rodada 2: Ponto e Caixa (08/09/2026)

Itens 12 e 13 da pesquisa de interface. Os dois tipos existiam no formato desde
sempre — §7.9 e §7.6 — e o editor não tinha a porta: criar um deles era escrever
JSON à mão.

- **Ferramenta Ponto (`O`).** `Alt` + arrastar cria; onde começou é o lugar,
  para onde arrastou é a direção. Sem `Alt`, arrastar **move** o ponto sob o
  cursor e `Shift` + arrastar **gira**. Um ponto é posição e rotação com nome: a
  boca do cano da arma, o alvo da câmera.
- **Ferramenta Caixa (`X`).** `Alt` + arrastar desenha o retângulo. Nasce como
  polígono de **quatro** vértices, e não como `rectangle`, porque polígono é o
  que a ferramenta Malha já sabe editar — depois de criada, arrastar os cantos é
  o gesto de sempre.
- **`AddPointAttachment` e `AddBoundingBox`** criam o slot **e** o anexo num
  passo de desfazer só: um slot sem anexo não mostra nada, e um anexo sem slot é
  peso morto no arquivo. Nascem na **pele visível**, não sempre na `default`, e
  uma pele que o comando criou não sobrevive ao desfazer.
- **O ponto é da montagem.** O formato não tem linha do tempo para a posição de
  um `point`: mexer nele com uma animação aberta muda a montagem, e a barra de
  baixo diz isso em vez de deixar a pessoa achar que gravou uma pose.
- **Painel Propriedades:** ponto com nome, x, y e rotação; caixa com nome,
  quantos cantos e a cor de editor. Nenhum dos dois tem campo "Imagem" — eles
  não desenham nada, e um campo que não muda a tela é pior do que campo nenhum.
- **Esqueleto → Novo → Ponto e → Caixa de colisão** deixaram de ser cinza. Eles
  escolhem a ferramenta e dizem o gesto na barra de baixo, em vez de criar no
  escuro num lugar que a pessoa teria que caçar.
- **Corrigido:** um `setPointerCapture` que estourava levava junto o resto do
  `pointerdown`, e a ferramenta nunca via o clique. Agora a captura é uma
  comodidade que pode falhar, não uma condição para editar.
- **A prova é pelo `pose-dump`**, o mesmo caminho por onde a conformidade
  confere os dois runtimes: o ponto criado em (40, 0) no osso `braco`, que está
  em (200, 0), sai em (240, 0) no mundo; num osso girado 90° o x local vira y.
- **Manual** nas duas línguas: capítulo 2 ganhou "Ponto e Caixa: o que o jogo lê
  e não se vê".
- **15 testes novos** (`editor/testes/lote5-ponto-e-caixa.test.ts`). Total:
  1.503 → 1.518.

### Acrescentado — lote 4 da rodada 2: a cena maior (08/09/2026)

Itens 15 e 17 da pesquisa de interface, e o primeiro lote da rodada 2. A cena
tinha **32%** da janela em 1440×900; agora tem **55%**.

- **A barra da cena virou uma linha só.** Cada ferramenta é um ícone com dica de
  nome e tecla; os Eixos viraram uma lista de três palavras no lugar de três
  botões; os dois cadeados perderam o rótulo "Travar" na frente. A barra caiu de
  **184px para 60px**.
- **`ui/icons.ts`, novo:** ícones SVG escritos à mão, 24×24, `currentColor`.
  Nada de fonte de ícones e nada de CDN — o editor tem que abrir sem internet, e
  uma fonte que não carrega deixa a barra com quadradinhos vazios. **São
  desenhos nossos**, feitos de linhas e círculos: não há nada de terceiros a
  creditar no `NOTICE`.
- **"Compensar" saiu da barra e foi para o painel Propriedades**, onde aparece
  **só com Mover, Girar ou Escalar ativa** — as três ferramentas em que as
  caixas mudam alguma coisa. Continuam ligadas ao mesmo `setCompensation` e
  continuam no menu Esqueleto.
- **A segunda barra da linha do tempo virou o menu do botão ⋯ Mais.** Fator,
  Esticar seleção, Espelhar no tempo, Fechar ciclo, Pares de nome e Espelhar
  esquerda e direita eram seis controles permanentes para gestos que se usam uma
  vez por animação. As quatro ações continuam no menu Animação, e o ⋯ Mais chama
  o mesmo `runAction`.
- **Preferências, em `ui/prefs.ts`:** "Mostrar nome das ferramentas", guardada em
  `RECORTE_prefs` no navegador e **nunca no `.bone`** — é escolha de quem usa,
  não do personagem. Editar → Preferências… e Exibir → Mostrar nome das
  ferramentas deixaram de ser cinza. Padrão **desligado**, que é o que faz a
  barra caber numa linha; a dica com nome e tecla continua nos dois casos.
- **A faixa de baixo nasce com 240px** em vez de 320: 320 era a altura de quando
  a linha do tempo tinha duas barras de botões.
- **`conferir-editor.mjs`** passou a imprimir quanto da janela é desenho, em por
  cento, com as alturas de cada parte.
- **Manual** nas duas línguas: capítulo 1 ganhou "A barra de ferramentas",
  capítulo 2 acompanhou a mudança de Eixos e Compensar, capítulo 3 trocou "A
  segunda barra" por "O botão ⋯ Mais".
- **21 testes novos** (`editor/testes/lote4-cena-maior.test.ts`). Total: 1.482 →
  1.503.

**Não chegou aos 60% que o plano pedia.** Medido: 55%. Os 5 que faltam só sairiam
da faixa de baixo, e ela já está em 240px para um conteúdo que ocupa 208px de
barras e régua — abaixo disso a folha de chaves fica sem linha nenhuma à vista.
Está escrito assim nos Desvios.

### Acrescentado — lote 3b da rodada 1: a linha Resumo (08/09/2026)

Item 8 da pesquisa de interface, e o último lote da rodada 1.

- **A linha Resumo**, primeira da folha, logo abaixo da régua e sempre visível.
  Um losango em cada tempo que tem chave em QUALQUER linha, mesmo dentro de um
  grupo fechado. A coluna da esquerda deixou de dizer "Alvo" — que era o nome da
  coluna — e passou a dizer "Resumo", que é o nome da linha.
- **Branco quando o tempo junta mais de um tipo de alvo** — uma pose e um
  evento, por exemplo —, porque quem arrasta precisa saber que está levando o
  evento junto.
- **Clicar escolhe todas as chaves daquele tempo** (`Shift` soma, `Ctrl` tira).
  **Arrastar move todas juntas**, encaixando no quadro, num passo só de
  desfazer: é o MESMO `EditKeys` com `moveKeys` do arrasto de chave que já
  existia, não um segundo caminho.
- **`anim/summary.ts`, novo:** `summaryTimes`, `refsAtTime`, `isMixedTime` e
  `summaryMarks`, que faz a linha inteira numa passada só. `summaryTimes` É
  `allKeyTimes`, de propósito: as setas `↑` e `↓` andam por essa mesma lista, e
  duas listas deixariam um losango num tempo onde a seta não para.
- **Corrigido: a chave de evento agora tem identidade própria na folha.** Ela é
  identificada por alvo, tempo **e nome**; antes, só por alvo e tempo. Duas
  chaves de evento no mesmo instante são legais no formato, e a folha as
  confundia: a que o Resumo escolhia era descartada no desenho seguinte e o
  arrasto a deixava para trás sem dizer nada. `dropMissingSelection` e os
  losangos passaram a ler `allKeyRefs`.
- **Manual** nas duas línguas: capítulo 3 ganhou "A linha Resumo" e dois gestos
  novos na tabela do mouse.
- **18 testes novos** (`editor/testes/lote3b-resumo.test.ts`). Total: 1.464 →
  1.482.

### Acrescentado — lote 3a da rodada 1: lista de desenhos e semáforo (08/09/2026)

Itens 9 e 10 da pesquisa de interface.

- **O campo "Anexo" virou uma LISTA.** Era um campo de texto: para trocar a mão
  aberta pela mão fechada era preciso saber o nome de cor e digitar sem errar
  uma letra — e um nome errado não dava erro, dava um slot vazio, e o desenho
  sumia sem uma palavra. `attachmentOptions(file, slot, visibleSkins)` mostra os
  anexos daquele slot nas peles visíveis, mais `(nenhum)` primeiro.
  `(nenhum)` **tira** o campo do arquivo em vez de gravar `""`.
- **Uma bolinha antes de cada anexo, na Árvore.** `●` é o desenho que o slot
  mostra agora, `○` é um que ele poderia mostrar. Clicar troca.
- **Os dois caminhos são o MESMO caminho.** `writeFieldValue` saiu de dentro do
  painel Propriedades e foi para `properties-model.ts`: é ela quem sabe se
  estamos em Montagem (escreve a pose de repouso) ou Animando (grava a chave, ou
  recusa com Gravar sozinho desligado). A Árvore chama a mesma função. Dois
  caminhos até o mesmo campo é onde a regra dos dois modos se perde num deles.
- **Chave de Desenho:** `targetForPointer` já entendia `/slots/i/attachment`, e
  a troca em Animando grava a chave no tempo do cursor sem tocar na montagem.
- **O semáforo do Chavear.** `◆` fica **verde** quando não há chave aqui para o
  escolhido, **vermelho** quando já há — apertar grava por cima — e **cinza** em
  Montagem ou sem nada escolhido. `keyButtonState` é função pura, e usa a MESMA
  lista de alvos que o botão grava (`targetsForSelection`): duas listas
  separadas dariam um botão verde que grava por cima de uma chave.
- **A dica muda junto com a cor.** Cor sozinha não serve: quem não distingue
  verde de vermelho leria dois botões iguais.
- **Laranja não entra**, e é de propósito. O `08` pede laranja para "mexeu e não
  gravou", e esse estado não existe: com Gravar sozinho desligado o arrasto é
  recusado e nada muda. Pintar laranja seria mentir. Decisão do Humberto,
  08/09/2026.
- **Manual** nas duas línguas: capítulo 2 ganhou "Trocar o desenho do slot" e
  capítulo 3 ganhou "A cor do Chavear".
- **18 testes novos** (`editor/testes/lote3a-desenho-e-semaforo.test.ts`).
  Total: 1.446 → 1.464.

### Acrescentado — lote 2 da rodada 1: o tocador e o Repetir (08/09/2026)

Itens 6 e 7 da pesquisa de interface. O tocador estava escondido no fim do
painel Animações, que é a lista de animações e não o lugar onde se trabalha o
tempo. Nos cinco programas pesquisados ele fica encostado na linha do tempo.

- **O tocador é a primeira linha da Linha do tempo.** Treze controles:
  `⏮ ⏪ ◂ ▶ ▸ ⏩ ⏭` · `🔁` · velocidade · tempo · duração · `●` · `◆`.
  **Só o símbolo aparece no botão** — decisão do Humberto, 08/09/2026 —, e o
  nome e a tecla ficam no `title` e no `aria-label`, com o mesmo texto nos dois.
  A lista é dado puro, em `panels/dopesheet-model.ts`.
- **`Espaço` toca e pausa** em qualquer lugar, menos na cena: lá ele continua
  arrastando a vista, e é a cena que trata a tecla e para o evento ali. `L`,
  `K` e `A` valem na janela inteira.
- **Repetir agora vai para o ARQUIVO.** O campo `loop` da §4.6 existia no
  formato e o runtime sempre o leu; o editor é que nunca o escrevia, e o botão
  "Laço" era uma caixinha de sessão que morria ao fechar a aba.
  `SetAnimationLoop` grava num passo de desfazer, e `revert` devolve o valor de
  antes **inclusive a ausência**: uma animação que não dizia nada sobre laço
  não volta dizendo `false`.
- **Um lugar só para ligar.** No painel Animações a palavra *repete* aparece ao
  lado da duração, mas ali é só leitura. Dois lugares que escrevem no mesmo
  campo é onde nascem as duas verdades. É como o Live2D faz.
- **`anim/transport.ts`, novo:** o motor de tocar, com o relógio injetado.
  Andar por diferença de relógio, e não por passo fixo, faz a animação tocar no
  tempo certo mesmo quando a máquina engasga. Sem laço, a agulha para NO fim.
  Trocar de animação sempre pausa.
- **A Prévia herda o laço:** escolher uma animação numa camada traz o `loop`
  dela. O campo da Prévia continua de sessão — ali é experimentar.
- **Cores:** `🔁` aceso é laranja, `●` aceso é vermelho. Vermelho é a cor do
  que grava sem pedir.
- **Em Montagem o tocador fica apagado:** não há tempo a andar.
- **O painel Animações ficou só com a lista** e os cinco botões de cima. O
  estilo do tocador antigo saiu de `panels.css` com ele.
- **`conferir-editor.mjs`** passou a achar o botão de tocar pela classe do
  tocador, e o relógio pelo campo de tempo.
- **Manual** nas duas línguas: capítulo 3 ganhou "O tocador: a primeira linha"
  e "A segunda linha", a seção Laço foi reescrita, e o passo 10 do capítulo 1
  agora manda apertar `Espaço`.
- **25 testes novos** (`editor/testes/lote2-tocador.test.ts`). Total: 1.421 →
  1.446.

### Acrescentado — lote 1 da rodada 1: o zoom no canto (08/09/2026)

Item 14 da pesquisa de interface. O zoom saiu da barra de cima e foi para o
canto inferior direito da cena, que é onde o Spine põe o dele.

- **A camada do canto:** `−` · `100%` · `+` · `Ajustar`. Fica por cima do
  canvas, encostada no canto, e nunca cobre o desenho — que fica no meio.
- **O `100%` é um campo.** Digitar `200` e apertar `Enter` põe a cena no dobro.
  Aceita `200`, `200%` e a vírgula decimal. Zero e negativo são recusados por
  escrito na barra de baixo: um zoom de zero não é uma vista pequena, é vista
  nenhuma. `Esc` desfaz o que se digitou.
- **Teclas novas:** `Ctrl+0` volta ao tamanho real e `F` enquadra **só o que
  está escolhido**. `Ctrl+=`, `Ctrl+−` e `Ctrl+Shift+F` já vinham do menu.
  `F` sem nada escolhido faz o mesmo que Ajustar à tela.
- **`viewport/zoom-model.ts`, novo:** `parseZoomPercent`, `formatZoomPercent` e
  `selectionBounds`, tudo puro e testado sem navegador.
- **A caixa da seleção não é uma segunda conta.** `selectionBounds` lê os
  vértices no mundo por `attachmentWorldPoints`, extraído de `picking.ts` e
  agora compartilhado com o retângulo de seleção: as duas leituras não têm como
  discordar. Osso entra pela raiz E pela ponta; caixa de colisão também conta.
- **Aproximar, Afastar e Ajustar à tela saíram da barra de cima.** Continuam no
  menu Exibir e nas teclas. Medido em 1440×900: a barra encolheu, mas continua
  com três linhas — os três botões dividiam a última linha com "Travar", então
  encurtaram essa linha em vez de apagá-la. "Uma linha só na barra" é o item 15,
  lotes 4 e 5.
- **`conferir-editor.mjs`** passou a achar o botão Ajustar pelo `aria-label`:
  no canto ele mostra só "Ajustar", e o nome inteiro está na dica.
- **Manual** nas duas línguas: capítulo 2 ganhou "Ver de perto e de longe" com
  a tabela das teclas, e o capítulo 1 uma nota curta.
- **20 testes novos** (`editor/testes/lote1-zoom.test.ts`). Total: 1.401 → 1.421.

### Acrescentado — lote menus da rodada 1 (08/09/2026)

A barra de menus passou de **três** menus para **sete**:
**Arquivo · Editar · Exibir · Esqueleto · Animação · Janela · Ajuda**.

O projeto saiu de `documentos/planos/PROJETO DO MENU 2026-09-08.md`, escrito
depois de ler os manuais do Spine, do Spriter, do Live2D, do Moho e do
Aseprite. Quatro dos seis programas têm essa mesma barra clássica.

- **Os sete menus, item por item.** `ui/menus.ts` continua sendo dado puro, uma
  função por menu, e agora com submenu (`children`), separador
  (`{ separator: true }`), marca de liga-desliga (`checked`) e a frase que
  explica um item cinza (`hint`). **Nenhum botão saiu da tela:** o menu chama a
  mesma função que o botão sempre chamou.
- **Registro de ações — `ui/actions.ts`, novo.** `registerAction`, `runAction`,
  `hasAction`, `actionState`. Cada painel registra as suas ao montar e as tira
  ao desmontar; o `shell` só faz `runAction(entry.action)`. É o que permite ao
  menu chamar o método de um painel sem que um importe o outro — e o que
  garante que não existe uma segunda cópia de nenhuma função.
- **Entrada cinza com a dica do lote.** O que ainda não existe aparece na
  lista, cinza, e a dica diz em que lote chega ("Vem no lote 4"). O mapa
  inteiro do programa fica à vista desde já. O que existe mas não cabe agora
  — Chavear em Montagem — diz "Abra uma animação primeiro".
- **Atalhos a partir dos próprios menus.** `shortcutMap` monta o mapa de teclas
  da mesma lista que desenha os menus, então a tecla escrita ao lado do item é
  a tecla que funciona. São 44 atalhos. A janela **Ajuda → Atalhos do teclado**
  (`Shift+F1`) mostra a tabela, gerada da mesma fonte, nunca de uma lista à
  parte. **Ajuda → Sobre o Recorte** traz versão, licença e onde está o manual.
- **Uma tecla é atendida uma vez.** O mapa é consultado por último, depois da
  ferramenta da cena, das teclas `7 8 9 0` e das letras de ferramenta. Quem
  trata, para o evento: a linha do tempo e a cena passaram a chamar
  `stopPropagation` nas teclas que respondem. `Espaço` com o foco **na cena**
  arrasta a vista; em qualquer outro lugar, toca e pausa.
- **Botão direito na cena volta à ferramenta anterior**, como no Spine.
  `previousToolFor` é função pura; a barra de baixo diz para onde você foi.
- **"Reempacotar atlas" mudou de menu:** saiu de Arquivo e foi para Esqueleto.
  É coisa do esqueleto, não do arquivo. O Live2D faz igual.
- **Uma janela de tabela** em `ui/dialog.ts` (`showTable`), com o cabeçalho
  preso no topo, para as 44 linhas dos atalhos ficarem legíveis em coluna.
- **Manual** nas duas línguas: capítulo 1 ganhou "A barra de menus" e "Botão
  direito na cena"; capítulo 8 ganhou "Onde está cada coisa" e o apêndice com
  a tabela inteira de atalhos.
- **31 testes novos** (`editor/testes/lote-menus.test.ts`), entre eles um que
  lê a seção 3 do `PROJETO DO MENU` e recusa qualquer tecla que o projeto
  escreva e o código não tenha. Total: 1.370 → 1.401.

### Acrescentado — lote 0 da pesquisa de menus (08/09/2026)

A pesquisa de interface (`documentos/pesquisa/menu/`, arquivos 00 a 07) olhou
nove programas e listou 52 coisas que faltam para o editor ficar funcional.
Este é o primeiro lote: o que trava montar um boneco.

- **Retângulo de seleção na cena.** Arrastar em área vazia desenha uma caixa
  e escolhe tudo que ela toca: osso pela raiz, desenho pelo contorno. `Shift`
  soma, `Ctrl` tira. Um clique seco em área vazia continua desmarcando. Todos
  os nove programas pesquisados têm isso; o editor só tinha `Shift` + clique.
  `pickInRect` e `selectionForPicks` em `viewport/picking.ts`.
- **Travar ossos e desenhos.** O botão mais elogiado do Spriter. Dois botões
  **Travar: Ossos · Desenhos** acima da cena (teclas `8` e `0`), e um cadeado
  em cada osso e cada slot do painel Árvore, para travar um só. O que está
  travado aparece (osso mais claro), mas o clique, o retângulo e a ferramenta
  Posar passam por ele. Ligar a trava tira da seleção o que ficou travado. As
  teclas `7` e `9` escondem e mostram ossos e desenhos, como no Spriter. A
  trava mora nas opções de exibição (`RECORTE_editor_state.view`), gravada no
  arquivo e no navegador; nunca no runtime.
- **Virar filho com `P`.** Escolha o que vai virar filho, aperte `P`, clique
  no osso pai. Vale para vários ossos e desenhos de uma vez, num passo só de
  desfazer (`ReparentMany`). É o `B` do Spriter e o `P` do Spine. O osso raiz
  e um ancestral do alvo são recusados por nome, na barra de baixo.
- **Manual**, capítulo 2, nas duas línguas: seção "Escolher: clique,
  retângulo e trava" e os dois jeitos de mudar o pai.

### Corrigido — lote 0 (08/09/2026)

- **Uma tecla apertada com a cena em foco era tratada duas vezes**: pela cena
  e, depois, pela janela, que escuta o documento inteiro. Para `Q`, `W`, `E`
  não fazia diferença; para um liga-desliga (`P`, `8`, `0`) fazia — apertado
  uma vez, voltava ao que estava. A cena agora segura a tecla que respondeu
  (`stopPropagation`).

### Corrigido — fase 8 (08/09/2026)

**Cinco defeitos que a suíte de conformidade não via.** Eles foram achados
apontando o confronto dos dois runtimes para o `heroi.bone` **inteiro**, fora
da suíte: os dois divergiam em **135 campos**, e mesmo assim passavam em 41 de
41 cada um, e concordavam em 41 de 41. Um arquivo de verdade tem combinações
que nenhum caso pequeno tem.

- **Física: o construtor do `Skeleton` gastava o quadro de reset.** A
  `updateWorldTransform(0)` do construtor — um aquecimento para as matrizes de
  mundo nascerem válidas — consumia o `reset = true` da §6.5, e o primeiro
  quadro de verdade já saía com o termo de inércia somado. Medido: o osso
  `hair` do herói saía a `161,05°` onde o outro runtime lia `160°`. O
  construtor agora chama `physicsReset()` depois do aquecimento. Um construtor
  é invisível para o executor da suíte: quem simula nele nunca concorda com
  quem não simula. Caso **C-261**.
- **Executor da suíte: a janela da chave `reset` era a errada.** Com
  `physicsDt`, cabem muitos passos entre duas amostras, e o cruzamento da §9.8
  era medido contra o tempo da **amostra** anterior em vez do tempo do
  **passo** anterior. O `reset` então redisparava em todo passo depois do
  cruzamento e, como `physicsReset` zera o acumulador, a física ficava **parada
  na pose de repouso para sempre**. Caso **C-262**.
- **Python: chave de `deform` com `value: []` congelava a malha.** A lista
  vazia era classificada como valor não numérico, a curva da chave virava
  `stepped` pela regra da §9.3, e o deform segurava o zero até a chave
  seguinte. Além disso, as chaves eram interpoladas **cruas** e só depois
  expandidas, o que alinha o índice 0 de uma com o índice 0 da outra: com
  `offset` diferente, o movimento ia para os vértices errados. A §9.6 manda
  expandir **antes**. Caso **A-031**.
- **Python: os UV de uma `sequence` não seguiam o quadro.** A região era
  resolvida uma vez, pelo `path`, ao carregar. Como o `path` de uma sequência
  costuma ser um prefixo (`"hand_"`), não existia região com esse nome e o
  runtime caía nos UV literais: geometria certa, **textura errada**. Caso
  **B-105**.
- **Python: dois canais do pose dump discordavam em forma.** O canal
  `vertices` deixava `clipping` e `path` de fora, e o canal `points` saía como
  lista de três números em vez de objeto com `x`, `y` e `rotation` — o que
  torna os dois dumps **incomparáveis**, mesmo dizendo o mesmo número. Caso
  **B-106**.

Cada correção foi conferida **quebrando-a de novo**: sem ela, o caso novo
reprova. Hoje os dois runtimes concordam campo a campo no `heroi.bone`
inteiro, nas três animações, nas três peles, com e sem laço — 18 combinações,
zero divergências.

### Acrescentado — fase 8 (08/09/2026)

**Nenhum campo novo entrou no formato nesta fase.** O `bone.schema.json` não
mudou.

- **Fatiar o arquivo** (`npm run fatiar`, requisito **E3**): corta por pele,
  por animação ou por pasta de slot. Só sai o que não move nada — um osso só
  sai quando nenhum slot, peso, trilha, regra ou parâmetro que sobrou lê ele;
  um slot fora da pasta volta sozinho se uma regra viva precisar dele, e o
  resumo diz que voltou. `binding.bones[]` guarda posição e `drawOrder` guarda
  deslocamento relativo (§9.5), então os dois são recalculados e conferidos.
  O atlas é reempacotado só com as regiões usadas. Medido no herói: por pasta
  `capa`, tudo 50,6% menor; por animação, esqueleto 39% menor.
- **Manual em inglês** (`documentos/manual/en/`, requisito **C1**): os oito
  capítulos mais o índice, com as mesmas imagens. Cada rótulo do editor sai em
  inglês com o rótulo português entre parênteses, porque a interface ainda é
  só em português. O guia de conformidade também:
  `conformidade/how-to-prove-conformance.md`.
- **Cinco casos de conformidade novos**: `A-031` (deform com `offset`
  diferente e chave vazia), `B-105` (UV de sequência quadro a quadro),
  `B-106` (quem entra em cada canal de geometria), `C-261` (o primeiro quadro
  da física não simula), `C-262` (a chave `reset` em laço). **De 41 para 46
  casos.**
- **Seis regras normativas novas na especificação** (Apêndice A, 56 a 61), nas
  §7.10, §9.3, §9.6, §10.4, §6.5, §9.8 e §12.4. Todas saíram de uma divergência
  medida, nenhuma de opinião.
- **`ferramentas/README.md`**, que não existia: o mapa das onze ferramentas,
  com exemplos que rodam como estão escritos.
- **`documentos/notas-de-desenvolvimento/conferir-editor.mjs`**: confere o
  editor sem clicar à mão — abre num Chrome headless, toca a animação, mede se
  a tela muda de quadro, lê o console e grava a foto.

### Corrigido — documentação (08/09/2026)

Todo comando escrito na documentação foi **executado**: 194 citações, 94
comandos distintos. Nenhum estava errado. O que estava errado era texto:

- Capítulo 6 (português) dizia que o `.bonez` do herói tem "cerca de 22 KB,
  cerca de 22%". O comando de hoje dá 23.166 bytes e 18,6%.
- Capítulo 7 (português) dizia "Não dá para importar PSD nem PSB", mas o
  capítulo 2 ensina **Arquivo → Importar PSD…** e o comando roda. O PSD tem
  porta própria; o importador de outros programas lê Spine, DragonBones e
  Spriter.
- Capítulo 8 (português) dizia "há o runtime de referência em TypeScript". São
  dois, e os dois passam na suíte.
- O `README.md` da raiz e o `conformidade/README.md` não apontavam para o
  `how-to-prove-conformance.md`. Agora apontam.
- A contagem de casos (41) ficou desatualizada em nove documentos.

Conferido também que **toda imagem citada em qualquer documento existe no
disco**: 33 citações locais, nenhuma quebrada, nenhuma órfã.

### Acrescentado — fase 7 (08/09/2026)

**Nenhum campo novo entrou no formato nesta fase.** A malha ligada usa
`parent`, `skin`, `path`, `width` e `height` da §7.5; a chave de evento usa
`event`, `int`, `float`, `string`, `volume` e `balance` da §9.2. O
`bone.schema.json` não mudou.

- **Segundo runtime do formato, em Python** (`runtime-python/`). Só biblioteca
  padrão. Escrito a partir do **texto da especificação**, sem abrir
  `runtime/src/`. Passa nos 41 casos de conformidade pelos dois caminhos: o
  executor próprio e o executor oficial em Node com `--adaptador`. 128 testes
  próprios em `unittest`. **A especificação deixou de ter uma implementação
  só.**
- **Confronto dos dois runtimes** (`ferramentas/comparar-runtimes.mjs`,
  `npm run conformidade:dois`). Roda os dois adaptadores no mesmo caso e
  compara os **dois dumps inteiros**, campo por campo — e não só o que o
  `esperado.json` cita, que é o que a suíte faz. Sai com código diferente de
  zero quando eles discordam. Relatório completo em
  `conformidade/dois-runtimes.md`. **41 de 41 concordam.**
- **Validador na web** (`site/validador/`, requisito F4, que fecha). Estático:
  sem servidor, sem rede, sem envio. Aceita `.bone`, `.boneb`, `.bonez` e
  `.atlas.json`, decidindo pelos bytes e não pelo nome. Veredito, problemas com
  linha e ponteiro JSON, ficha do conteúdo, oito contas, recursos usados e o
  esqueleto desenhado pelo runtime de verdade, com botão de tocar. O esquema é
  compilado antes por `site/validador/construir-esquema.mjs`, com o mesmo Ajv
  da linha de comando. Página inicial em `site/index.html`.
- **Exportar imagem** (requisito E5, parcial): folha de sprites com JSON de
  índice, sequência de PNG e **GIF animado** escrito byte a byte — paleta por
  median cut, LZW próprio, bloco NETSCAPE com laço. Pela linha de comando
  (`npm run exportar-imagem`) e pelo editor (**Arquivo → Exportar imagem…**).
  Um rasterizador só, o mesmo do `render-png.mjs`. **MP4 não sai**: o comando
  do ffmpeg aparece na tela.
- **Chave de evento no editor** (requisito A3, que fecha): bloco **Chave de
  evento** no painel Propriedades e no pé da Linha do tempo, com a lista dos
  eventos e os cinco campos, cada um dizendo se o valor está na chave ou vem da
  definição.
- **Malha ligada pelo editor**: botão **Ligar a outra malha** no painel Malha e
  pesos. O arquivo ganha três campos e nenhum número de geometria; o runtime
  aponta para os mesmos arrays do pai.
- **Dois casos de conformidade novos**, os dois conferidos pelos dois caminhos
  e pelos dois runtimes: **A-029-draworder-colisao** (colisão de `drawOrder` e
  índice fora de faixa) e **B-104-linkedmesh** (geometria emprestada e os dois
  valores de `inheritDeform`). `linkedmesh` saiu da lista do que a suíte não
  cobre.

### Corrigido — fase 7 (08/09/2026)

Tudo aqui saiu do confronto entre os dois runtimes. Nada foi achado por teste
de unidade: foi achado pondo dois dumps lado a lado.

- **Especificação, §9.3 — a parada do solver de Bézier estava no eixo errado.**
  O texto mandava parar em `|x(s) − t| <= 1e-6 × (t1 − t0)`, uma tolerância no
  eixo do **tempo**. O erro que sobra em `s` chega ao valor multiplicado por
  `|v'(s)| / |x'(s)|`, razão sem limite superior. Medido: dois runtimes
  conformes divergiram **8,5e-5** no caso A-020, contra tolerância de `1e-4`.
  A parada passou a ser medida em `s`. Os **três** solvers do projeto — runtime
  TypeScript, runtime Python e o do editor — foram trocados; a divergência caiu
  para `5e-7`.
- **Especificação, §5.6 — a regra de sujeira virou normativa.** Ela estava
  escrita como otimização ("PODE"). Ao pé da letra, o passo 3 recalcula tudo, e
  o caso C-230 reprova por **0,116**, com tolerância de `0,0001`.
- **Especificação, §5.1 e §6.5 — o estado da física atravessa a setup pose.**
  A §5.1 dizia "todos os valores" da constraint. Lendo assim, a física nunca
  acumula e o C-260 reprova. Agora as duas seções separam **valor animável** de
  **estado de simulação**.
- **Especificação, §12.4 — presença de campo no dump é normativa**, com a
  tabela dos cinco campos de `slots`. Sem isso os dois runtimes divergiam em 10
  de 39 casos **sem nenhum deles falhar**: o harness só compara o que o
  esperado cita.
- **Especificação, §12.4 — `physicsDt`, a janela do canal `events` e o `loop`
  da sonda** saíram do `leiame.md` de caso e viraram texto normativo.
- **Especificação, §2.8 — a base dentro do `.bonez` é a pasta do `main`**, sem
  segunda chance na raiz do ZIP. O runtime de referência tentava a raiz; o de
  Python, não.
- **Especificação, §9.5 — a palavra "descitado"** na colisão de `drawOrder`.
  Sem ela, o passo 2 pula o slot que perdeu e sobra buraco na ordem: o runtime
  desenha um slot a menos.
- **Especificação, §6.4** — `extrapolaAntes` e `extrapolaDepois`, chamadas pelo
  pseudocódigo e nunca definidas, agora estão definidas; e ficou escrito qual
  dos dois comprimentos do caminho é o `total`.
- **Especificação, §6.5, §7.3 e §9.6** — `remaining = a` vale em todos os
  caminhos; `width: 0` sem atlas e sem imagem é attachment vazio; a ordem de
  busca do `deform` por skin.
- **Runtime de referência** — o canal `uvs` do pose dump passou a incluir
  `linkedmesh`, que tem imagem própria; e a segunda chance de resolução na raiz
  do `.bonez` saiu.
- **`.gitignore`** — a linha `dist/` escondia `ferramentas/visualizador/dist/`,
  o runtime compilado que o validador da web carrega para desenhar. Num clone
  novo a página validava e o quadro do desenho ficava vazio.
- **Ícone das páginas** — o `favicon.ico` da raiz estava vazio e dava 404 no
  console do editor. Agora existe, com 32×32, e as três páginas apontam para
  ele. O console do editor está limpo.

**Treze entradas novas no Apêndice A da especificação (43 a 55), todas com
origem "dois runtimes".**

---

### Acrescentado — fase 6 (08/09/2026)

**Nenhum campo novo entrou no formato nesta fase.** Camadas, máscara de ossos e
compensação vivem no programa, não no arquivo; a cor e o ícone do osso já
existiam na §4.2, e a duração de mistura já existia como `animation.defaultMix`
na §4.6 — o que mudou é que agora alguém a lê.

- **Camadas de animação e mistura, no runtime** (requisitos A5 e T5).
  `runtime/src/animation-state.ts`: `AnimationState` (faixas numeradas,
  animação corrente, tempo, laço, velocidade, alpha, fila com atraso,
  ouvintes), `AnimationStateData` (tabela de duração de mistura por par, com
  `animation.defaultMix` da §4.6 como padrão) e `applyAnimationMixed` — o
  `applyAnimation` da §9.10 com alpha, os quatro modos (`setup`, `first`,
  `replace`, `add`) e máscara de ossos. Com alpha 1 e sem máscara escreve
  exatamente o que a §9.10 manda, e há teste comparando com `applyAnimation`.
- **Painel Prévia, no editor** (requisito A7): até quatro camadas misturadas ao
  vivo num segundo esqueleto, com o relógio de cada uma escrito, e "Copiar para
  a linha do tempo" gravando o resultado como animação nova.
- **Importar PSD e PSB em camadas** (requisitos R3 e I1).
  `ferramentas/src/importar/psd.ts`, TypeScript puro e sem dependência:
  compressões 0, 1 (RLE) e 2/3 (ZIP), 8 e 16 bits, nome Unicode, grupos virando
  pasta. Pelo menu (**Arquivo → Importar PSD…**) e pela linha de comando
  (`npm run importar-psd`). Cada camada vira um slot na posição em que estava
  no Photoshop.
- **Eixos local, pai e mundo, e compensação** (requisito R7): seletor e três
  caixas na barra do viewport. Mover, girar ou escalar um osso sem tirar do
  lugar os filhos, os desenhos e as caixas.
- **Segunda barra da Linha do tempo** (requisitos A1 e A6): esticar a seleção
  por um fator, espelhar no tempo, fechar ciclo casando as tangentes, e
  espelhar esquerda e direita por pares de nome configuráveis.
- **Cor e ícone do osso** no painel Propriedades (requisito R2), desenhados na
  tela.
- `ui/dialog.ts` ganhou **`askUser`**: a pergunta de sim ou não com a resposta
  escrita em cada botão. O editor deixou de usar `window.confirm`, que escreve
  "OK" e "Cancelar" — palavras que não dizem o que vai acontecer.

### Corrigido — fase 6

- **A janela do editor rolava inteira.** Um filho posicionado da régua da Linha
  do tempo passava da borda e esticava a página para 2.630 px; bastava um campo
  receber foco lá embaixo para a barra de menus sair da tela. A concha agora é
  presa na janela (`position: fixed; inset: 0`), com `overflow: hidden` no
  `html` e no `body`. Só `overflow: hidden` não bastava: ele segura a roda do
  mouse, mas não segura `scrollIntoView`.
- **Um atlas por documento.** "Importar PSD" empacotava num atlas próprio e
  substituía o das imagens importadas — e o que fosse salvo depois não trazia as
  páginas do PSD. Os dois importadores passaram a dividir o mesmo acervo.

### Acrescentado

- Canal **`uvs`** no pose dump da §12.4: as coordenadas de textura de cada
  `region` e `mesh` na tela. Sem ele a suíte não enxergava erro de textura
  nenhum — trocar os UVs do recorte pelos literais da §7.3 passava nos 31
  casos de então, B-102 incluído.
- Casos de conformidade novos: **B-103** (região de atlas girada 90°),
  **C-224** (mistura parcial com diferença de mais de 180°), **C-230** (osso
  com shear sob regra de transformação), **C-231** (coluna zerada e a guarda
  do `atan2(0, 0)`), **X-304** e **X-305** (as duas metades de
  `extensionsUsed` e `extensionsRequired`), **BIN-401** (a embalagem binária),
  **ZIP-501** (o pacote e o manifesto). De 31 para 39 casos, e as categorias
  BIN e ZIP deixam de ser conjuntos vazios.
- Casos ampliados: **A-020** ganhou uma alça de Bézier fora do intervalo, para
  prender a correção obrigatória da §9.3.
- Contrato de **recusa** na suíte: um caso pode exigir que o arquivo não
  carregue (bloco `"recusa"` no `esperado.json`). Antes não havia como
  escrever o caso de `extensionsRequired`.
- `conformidade/adaptador-referencia.mjs`: um adaptador que roda e passa nos
  39 casos, para um implementador comparar linha a linha com o dele.
- `conformidade/REGISTRY.md` e `formato/extensions/REGISTRY.md`: os dois
  registros públicos que a §12.4 e a §2.7 citavam e que não existiam.
- `LICENSE` (Apache 2.0, com a outorga de patente da cláusula 3),
  `formato/LICENSE` (CC BY 4.0) e `NOTICE`. Cabeçalho SPDX em todo `.ts` e
  `.mjs` de `runtime/` e `ferramentas/`.
- `formato/exemplos/manifest.json`: o terceiro tipo que o validador conhece
  passa a ter exemplo público. `--todos` valida 5 arquivos, cobrindo os três.
- Editor: criar **regra** (IK, transformação, caminho, física, comando),
  **evento**, **pele** e **parâmetro** pelo painel Árvore. Antes não existia
  nenhum comando para criar regra, e um personagem montado do zero nunca
  ganhava cadeia de IK nem física de cabelo.
- Editor: rascunho automático em `localStorage`, com recuperação na abertura, e
  aviso do navegador ao fechar a aba com trabalho não salvo.
- `CONTRIBUTING.md` e este arquivo.

### Corrigido

- **§7.3** passa a trazer a fórmula dos UVs do recorte por escrito, com o
  motivo. A forma curta (`(0,1) (1,1) (1,0) (0,0)`) só coincide quando não há
  `offsetX`/`offsetY`; com offset, dava a textura da imagem inteira encolhida.
  Fecha a dúvida 1 do `DUVIDAS-SPEC.md`.
- **§11.5** passa a dizer que `TKEY` **não** é obrigatório quando alguma chave
  traz `curve: "linear"` escrita, com o motivo: o `TKEY` não distingue "sem
  curve" de "curve linear", e a §11.1 exige ida e volta exata. Sem a exceção,
  um arquivo com 64 chaves ou mais e um `"linear"` escrito não teria gravação
  legal nenhuma. Fecha a dúvida 22.
- **§5.5** passa a dizer, no lugar onde o erro estaria, que o sinal de
  `shearY` na raiz é o **oposto** do do ramo com pai, que isso é o
  comportamento portado do Spine 4.2, e que alinhar os dois depende da
  conferência contra o `spine-runtimes` que a §12.4 já exige. Registra a
  dúvida 10 onde quem porta vai ler.
- **§12.4** passa a listar as pastas reais do repositório e a dizer, por
  extenso, **o que a suíte ainda não cobre** — para "39 de 39" não ser lido
  como "implementa tudo". Também passa a descrever o segundo caminho de
  conferência como o que ele de fato é: a conta à mão no `leiame.md`.
- `npm run importar` com um projeto do Spine e **sem** `--atlas` morria com
  `Cannot read properties of null (reading 'trim')`: a guarda testava contra
  `undefined` e a linha de comando passava `null`. Agora importa, e avisa em
  português que as regiões saem sem recorte.
- O exemplo de código do `README.md` não rodava: apontava para
  `./runtime/src/file.js`, que não existe.
- O mínimo de Node documentado estava errado — dizia 20, e dois comandos leem
  TypeScript direto, o que precisa de 22.18. `package.json` ganhou `engines`.
- A redução do `.boneb` publicada como "cerca de 60%" não reproduz: são 37,5%
  medidos no `heroi.bone` (28.467 → 17.804 bytes).
- Os comandos de importação do `README.md` citavam arquivos que não existem no
  projeto. O primeiro exemplo agora usa as fixtures que acompanham o projeto e
  roda como está escrito.
- `render-png.mjs` aceita o esqueleto como argumento, e diz qual usou quando
  nenhum é passado.
- O guia de conformidade autorizava publicar "nível R" — uma afirmação que
  ninguém podia conquistar nem conferir, porque não existe nenhum caso `R-`.
- Editor: um clique numa chave do painel Curvas **movia** a chave. Agora
  escolher é escolher, o arrasto só começa depois de 4 px, e o tempo encaixa
  no quadro em vez de parar em 3 casas decimais fora da grade.
- Editor: o painel Curvas escondia os próprios controles — "Formato da curva" e
  a lista de canais — sem barra de rolagem e sem sinal.
- Editor: a área de desenho encolhia até 25 px de altura, porque o mínimo era
  medido no `<main>` e não no canvas.
- Editor: apagar com só o osso raiz escolhido sujava o arquivo e criava um
  passo de desfazer sem apagar nada.
- Editor: trocar de animação escrevia o nome cru da animação no lugar
  reservado à última ação ("walk. Arquivo não salvo.").
- Editor: os cinco CSS dos painéis entravam por `<link>` criado por script, que
  não bloqueia a pintura — havia uma janela em que a tela aparecia sem estilo.
- Editor: arrastar qualquer coisa pintava a interface inteira de azul de
  seleção.

---

## [1.0] — ainda não congelada

A 1.0 será congelada num commit assinado, com a suíte de conformidade daquele
dia como anexo normativo, quando as oito decisões em aberto do `ESTADO.md`
estiverem fechadas.
