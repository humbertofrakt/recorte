# Onde o projeto está — 05/11/2026 (v37.0: a noite das tomadas, do guarda-roupa, do reaproveitar e do programa achável)

> **Leia primeiro:** `documentos/projeto do programa/noite/RESUMO DA NOITE.md`. O quadro abaixo é o de 05/11; o de 07/10 (v36.5) continua mais abaixo, como história.

| O quê | Hoje (05/11/2026, 03h50 UTC) |
|:---|:---|
| Versão | **v37.0** — `programa/` montado; publicado em https://humbertofrakt.github.io/recorte/ |
| Testes | **6.124** (6.113 passam, 11 pulados, **0 vermelho**). `tsc` limpo |
| Conformidade | **138 de 138** (TS, Python e o pacote do Construct). O Godot não rodou na nuvem: 4 comandos em `noite/godot.md` |
| Roteiro dos 30 minutos | **14 de 14** |
| Pesos | **14 de 14** |
| Painéis | **92 de 92** de lado e de altura (e 92/92 com os Detalhes abertos) |
| Provas de pessoa (só cliques à vista) | tomadas 13/13 · espada 18/18 · prova final 13/13 · oficina · skins · reaproveitar |


## O quadro de 07/10/2026 (v36.5)

| O quê | Hoje |
|:---|:---|
| Versão | **v36.5** — `backup/versoes/recorte v36.5 2026-10-07.zip`. **Rodada 50, lote 4** (doc `98`, itens E e D; docs `100` e `101`): o × da aba com caixa e longe do nome, a marca da aba à frente no topo; o rodapé fala do painel ("Painel Árvore fechado"); a Árvore do quadro segue a chave slot/bone; "Colar só o que cabe" diz o que ficou de fora; o Reabrir diz o remédio; a janela do exportar não pula. **A rodada 50 terminou**: v36.2, v36.3, v36.4, v36.5. Reprovado com o mouse de verdade |
| Testes | **5.806** em 91 arquivos (5.776 passam, 29 pulados, **1 vermelho**: o do manual, de 15/09, em `exportar-e-ajuda.test.ts`). `tsc` limpo. Medido em 07/10, 14:23, `npx vitest run` inteiro, com o semáforo da rodada 50. **Contagem por arquivo** em `backup/contagem-testes_2026-10-07_14-23_v36.5.tsv` (nenhum arquivo caiu) |
| Conformidade | **120 de 120** — `A 13 · B 7 · BIN 1 · C 63 · P 28 · X 7 · ZIP 1` (07/10, 14:24). Nada mudou em `runtime/`. **O leitor do Godot fica em 119 de 120** até copiar o conserto do C-326 do Python. Em `casos-pendentes/` ficou só o P-002 |
| Roteiro dos 30 minutos | **14 de 14** (`npm run roteiro`). Desde a v12.7 o passo 14 fecha de verdade: recarrega a página, recusa a janela de recuperar rascunho, e confere que o arranjo de tela não vaza para o `.bone`. **A pendência de 14/09 (vermelho ao rodar em dobro) explicada:** o script abre o editor em portas FIXAS (5191 e 9335), e duas rodadas ao mesmo tempo brigam pela porta. Regra nova, escrita em `documentos/QUEM E QUEM.md`, "A regra das portas": só quem está fechando roda roteiro/medição, um de cada vez. Rodado sozinho na v13.2: limpo |
| Painéis | **90 de 90** de lado, **83 de 90** de altura (`npm run medir`, 07/10, 14:26, com a casa vazia; a aba Regras não rola mais em 1920 desde a v35.7, fora da medição; **subiu 2** desde a v34.8: a Malha cabe em 1440, e a ficha do Comando também). Os 7 que rolam: a ficha completa do desenho (13 e 135 px: dois grupos só, não dobra), a do Comando em 1280 (78 px), a Exibição (72 e 194 px), a Malha em 1280 (169 px) e a Prévia em 1280 (o palco) — um por um no doc `68` |
| Pesos | **14 de 14** (`npm run pesos`, 07/10, 14:26; com um clique a mais, abrir a dobra dos Ossos da Malha, v35.2), uma imagem em dois ossos. A prova foi consertada na v32.4: procurava o botão "Ligar" (é "Ligar ossos" desde a rodada 6) |
| Leitor do Construct | **Existe**, em `leitor-construct/` (rodadas K1 a K7, sem a K5 da conexão). Addon `saida/Recorte.c3addon` (r449), exemplo `saida/heroi-andando.c3p`, passo a passo em `leitor-construct/LEIA-ME.md`. **120 de 120 sobre o pacote** (05/10, 20:59), remontado com os consertos da rodada 35. Ainda não visto no Construct: é a mão do Humberto |

O que já funciona, como no Spriter:

| Parte | O que faz |
|:---|:---|
| Começar | Abre vazio. **Arquivo → Novo projeto…** pede a pasta (v28.5), como o Spriter; **Arquivo → Abrir pasta…** continua; a aba Imagens mostra as subpastas; arrastar monta. **Salvar** empacota o atlas ao lado do `.bone`; reabrir a pasta continua de onde parou |
| Imagens | Pivô por imagem (Definir pivô…, repetir para a pasta). **Botão direito** no desenho: a grade para trocar, com opções. O clique passa pelo transparente |
| Ossos | Primeiro a arte, depois os ossos: criar osso pega os desenhos escolhidos sem mover. **P segurado + clique** vira filho, na cena e na Árvore. P numa malha liga o osso a ela |
| Árvore | Uma árvore só: o osso com os desenhos dele por baixo, depois os filhos. Dobra, busca, arrastar troca o pai sem mover |
| Ordem | **Ctrl + setas** na cena e na aba Ordem. Em Animando vira chave. Editar → Copiar a ordem na animação |
| Animar | Gravar sozinho; o começo se guarda sozinho; **Espaço** toca em toda parte. Criar osso, ponto, caixa e imagem em Animando. **Trocar de pai vira chave**: a arma sai da mão e vai para as costas no meio da animação, sem perguntar nada, e a Árvore mostra o pai daquele quadro |
| Copiar chaves | Escolher o osso na cena ou na Árvore e `Ctrl+C` basta: leva o **membro inteiro**, com os filhos. **Colar espelhado** no menu Animação troca `_e` por `_d`. **Empurrar as chaves…** move as marcadas, ou empurra tudo que vem depois para abrir espaço. **Limpar chaves repetidas** tira a chave que não muda nada, sem tocar numa chave `stepped` nem numa linha não numérica |
| Painéis | Nenhum rola de lado. Malha e pesos começa por Forma |
| Pesos | **Ligar** abre o modo: clique nos ossos, na cena ou na Árvore, com qualquer ferramenta na mão, e cada um entra com a sua cor. Cada vértice é uma pizza. Escolher o osso a pintar não derruba a malha. Como no Spine e no DragonBones |
| Ferramentas | O **Transformar** é o primeiro botão e faz tudo: dentro move, a bolinha gira, o quadradinho escala, e **Alt + o meio de um lado inclina**. Mover, Girar, Escalar e Inclinar continuam na barra. Pai e filho escolhidos juntos: só o pai recebe a conta |
| A caixa | Gira junto com o desenho. A bolinha de girar mora na metade de cima do osso, longe do pivô. **Três** quadradinhos no osso (os lados e o de cima), **oito** no desenho — e o que não está na tela não responde ao toque |
| Criar | Clicar numa imagem na cena **não** escolhe osso: o osso novo deixou de enganchar em coisa que ninguém escolheu. Vale para o Ponto e a Caixa. Na Árvore, arrastar o filho para cima do pai **troca os dois de lugar** |
| Malha | Vale nos **dois modos**: a forma e os pesos vão para a pose de repouso, e só arrastar um vértice grava chave — a aba diz isso numa linha. Cada botão com um nome só: Usar a forma de outra malha · Criar aresta · Ligar ossos · Suavizar tudo. Nome curto no botão, a frase inteira na dica. O contorno nasce 2 px afastado da arte. Modo **Criar vértice**: clique simples. Gerar malha **não move mais o desenho** |
| A coluna | Cada grupo tem um **botão de recolher** (o `▾` no fim da tira): some o painel, fica a fila de nomes, e o espaço vai todo para o outro. Clicar num nome recolhido abre de volta. A altura segue **a aba em uso**; arrastar a alça manda, e dois cliques nela devolvem o automático |
| Arrumar do seu jeito | **Arrastar a aba** a leva para onde o dedo soltar — outro grupo, ou outro lugar na mesma fila. Enquanto a mão segura, uma **linha azul** mostra onde ela vai entrar; sobre o corpo de outro grupo, um **contorno azul**, e ela entra no fim dele (v26.6). `Esc` cancela. **Janela → Voltar ao padrão** devolve tudo ao de fábrica, inclusive na próxima abertura |
| Fechar e achar de novo | O **`×` da aba em uso** fecha o painel; o **botão direito na fila de abas** fecha o grupo inteiro (ou **Janela → Fechar o grupo**). Tudo o que se fecha continua escrito no **menu Janela**, e volta **no lugar de onde saiu**. O último painel aberto não se fecha: a coluna nunca fica muda |
| Descolar da lateral | Arrastar a aba **para fora** solta o painel: **a sombra do painel segue a mão** (v26.6; antes era o arrasto do navegador, com o cursor "proibido" sobre a cena — era por isso que os painéis pareciam presos na parede). Ele flutua sobre a cena, com barra de título, `×` e canto para mudar o tamanho. Arrastar a barra até uma fila de abas o **cola de volta**, com a mesma linha azul. Porta de menu: **Janela → Arrumar → Soltar o painel da parede**. O desenho continua respondendo por baixo |
| A tela é sua, o arquivo é do boneco | A arrumação dos painéis mora **na sua máquina**, e não dentro do `.bone`: abrir o boneco de outra pessoa não mexe na sua tela, e o boneco que você entrega não leva a sua arrumação junto |

Planos desta rodada, todos feitos: pivô e Animando, pasta do projeto, malha,
consertos do teste, painéis que cabem, árvore, ordem, o roteiro e os pesos. Os
Desvios estão no fim de cada plano, em `documentos/planos/`.

**Feito: o plano arrumação** (A1 a A8, v10.4 a v11.3). Nada mudou de
comportamento: o programa que o Humberto testa faz o mesmo, e cada parte mora
no seu lugar.

| Lote | Onde olhar |
|:---|:---|
| A1 | toda tecla em `editor/src/ui/keys.ts` |
| A2 | toda ação de menu com dono em `editor/src/ui/actions-table.ts`; 22 valem sem aba nenhuma |
| A3 | os testes por assunto: `editor/testes/arvore.test.ts`, `ordem.test.ts`… (37 arquivos) |
| A4 | quem importa quem: os degraus no cabeçalho de `contract.ts`, e o teste `fronteiras` |
| A5 | a casca, a linha do tempo, a cena e o modelo da Árvore em pedaços |
| A6 | um CSS por painel (`tree.css`, `palette.css`…); as 22 fotos iguais às de antes |
| A7 | este ESTADO curto; a história em `documentos/HISTORICO.md`; as provas em `ferramentas/provas/` |
| A8 | o mapa das partes, para vários chats: `documentos/PARTES.md` |
---

## O que ainda não cabe na altura — 13/09/2026

A medição de altura (`npm run medir`) é nova, e **estes vermelhos são
conhecidos, não esquecidos**. Vermelho escrito não é dívida escondida: é uma
lista de trabalho. A régua é "o que rola tem de ser lista que cresce com o
arquivo, nunca texto fixo do painel" — por isso Árvore, Ordem, Imagens,
Animações, Peles e Regras estão verdes mesmo rolando: elas são listas.

| Aba | 1440×900 | 1280×720 | De quem, e por quê |
|:---|---:|---:|:---|
| **Propriedades** | 71 px | 193 px | Já caiu de 591. Cabe sozinho em 1440×900 com o outro grupo fechado — ver abaixo |
| **Exibição** | 73 px | 141 px* | Já caiu de 653. Cabe sozinho em 1440×900 com o outro grupo fechado — ver abaixo |
| **Malha e pesos** | 372 px | 494 px | Já caiu de 961/1.083 (14/09, aperto de recheio: padding, borda e altura mínima de botão — nenhum campo a menos) |

\* **Resolvido em 13/09, e a suspeita era boa.** O número de 1280×720 da
Exibição foi visto oscilando de 73 a 196 px entre rodadas, sem ninguém mexer
nela — e, no mesmo dia, a prova já tinha mentido de três jeitos diferentes, o
que fazia temer um quarto. Medido de novo com a **árvore parada**, três rodadas
seguidas: **67 px em 1440×900 e 190 em 1280×720, idênticos nas três**. Era a
obra ao lado, a coluna mudando debaixo dela enquanto o outro lote acontecia.
A prova está firme; os números da tabela acima são esses.

### Cabe na tela grande, rola na pequena

Quatro abas ficaram assim, e a frase vale para as quatro. **Não é descuido: é
limite conhecido, medido, e escrito para quem for mexer nisso depois.**

O que mudou o jogo foi **fechar um grupo**: cada painel fechado devolve altura
ao que fica, e é isso que faz as contas fecharem na tela grande.

| Aba | 1440×900 | 1280×720 |
|:---|:---|:---|
| **Malha e pesos** | 368 px de espaço com o vizinho fechado — precisa de bem mais: **faltam ~150 px**, mesmo assim | faltam **~450 px**, mesmo com o vizinho fechado |
| **Propriedades** | **cabe**, com o grupo Árvore/Ordem fechado (medido: sobram 0 px) | faltam **88 px**, mesmo com o outro grupo fechado |
| **Exibição** | **cabe**, com o grupo Animações/Peles/Regras/Histórico/Malha fechado (medido: sobram 0 px) | faltam **141 px**, mesmo com o outro grupo fechado |
| **Prévia** | **cabe** | faltam **13 px** para o palco e o começo da camada 0 |

**A conta da malha mudou de régua em 14/09, e por decisão, não por engano.**
O "precisa de 419 px" de 13/09 só contava o que **nunca poderia ser dobrado**
— e contava Ossos e Pesos como coisa que PODERIA. O pedido de 14/09 fechou
essa porta: *"não esconda a malha ou os pesos para ganhar número"*. Com Ossos
e Pesos sempre à vista (o que ele de fato usa), a conta certa é outra — e bem
maior, porque cada osso da lista e cada botão de peso é uma linha que não
existia na conta antiga.

O que o aperto de 14/09 fez, só em recheio (padding, borda, altura mínima de
campo e de botão — nenhum campo, osso ou botão a menos): o painel **vazio**
caiu de 961/1.083 px de sobra para 372/494 (mais da metade). Mesmo assim, com
o vizinho fechado e um desenho com malha e dois ossos escolhido, ainda faltam
uns 450 px em 1280×720. **Não fechei — parei e escrevi o número, como
combinado**: os botões com nome por extenso (regra desta aba, pedido do
Humberto em 13/09: "ícone sozinho não se lê") são largos demais para dois por
linha numa coluna de ~220 px, e por isso cada um vira uma linha inteira —
cinco só na seção Forma. Apertar mais essa régua sem tirar palavra nenhuma do
nome esbarra num limite de largura de coluna, não de CSS.

**A escolha que sobra é dele, não da equipe — três saídas, escritas para
quando ele quiser decidir:**

| Saída | O que custa |
|:---|:---|
| Nome mais curto nos botões | Perde clareza — é ir contra o próprio pedido de 13/09 ("ícone sozinho não se lê") |
| Coluna mais larga por padrão | Tira espaço da cena, que é o que se olha o dia inteiro |
| A aba rolar em 1280×720 | Já é o que a Prévia faz, com régua própria (palco inteiro à vista, o resto rola) — ele já aceitou essa saída uma vez |

Sobre a Prévia, e a conta é minha: ela tinha passado na régua do palco nas duas
medidas. O `×` que fecha o painel, na aba em uso, custa 20 px de largura na tira
de abas — e numa tira de 250 px com três abas isso a faz **quebrar em duas
linhas**, o que tira 33 px de altura do painel. O botão de fechar o grupo saiu
da tira por causa disso (virou o botão direito, com a porta visível em Janela →
Fechar o grupo); os 20 px do `×` da aba continuam lá, porque fechar o painel é
o gesto que o Humberto pediu.

**A troca, dita como troca:** o botão de fechar custa 13 px da Prévia numa tela
de 1280×720. Se um dia se quiser os dois, a saída conhecida é o palco encolher
com o painel.

O parágrafo abaixo continua valendo — a régua da Prévia é outra, e o porquê:

**A Prévia tem régua própria desde 13/09, por decisão e não por desistência.** Ela
tem PALCO — um canvas de proporção fixa —, e nenhuma arrumação de conteúdo faria
o painel inteiro caber: dobrar mais só esconderia melhor. O Humberto decidiu que
um painel com palco **pode** rolar, e a régua dele passou a ser outra: **o palco
inteiro, e o começo do que vem depois dele, à vista sem rolar.**

Ela passa nessa régua nas duas medidas, e não foi de graça: a barra do tocador
virou `▶ ❚❚ ■ ⏮` e coube numa linha em vez de duas, devolvendo 46 px ao painel
(corpo de 274 → 321 px em 1440×900, e de 152 → **198** em 1280×720, para um
palco de 160). Antes disso o conteúdo já tinha caído de 1.933 para 692 px, com
as camadas e a caixa de copiar dobradas.

A marca `data-rolagem="palco"` **troca a régua, nunca isenta** — a primeira
versão dela isentava, e era o falso verde de novo.

Uma advertência que vale mais que os números: **a prova dava um falso verde**.
Ela media a aba Malha e pesos sem desenho escolhido — o painel inteiro trocado
por uma frase — e saía verde. Uma prova que mede tela vazia não prova nada. O
número honesto passou de 15 para 14 de 22 quando isso foi consertado.

---

A história do projeto — as rodadas, as fases, o que foi conferido em cada uma — está em
`documentos/HISTORICO.md`, sem mudar uma letra (lote A7). O mapa das partes, para vários
chats ao mesmo tempo, está em `documentos/PARTES.md`.

---

## O que está aberto — 14/09/2026

Tudo o que está de pé, num quadro só: **`documentos/planos/QUADRO ABERTO 2026-09-14.md`**.

A frente da semana é **terminar o fluxo criar e animar**. Decidido em 14/09: o
modo Montar **sai como lugar** e vira arrumação de tela. O porquê, o custo (124
lugares em 39 arquivos) e a ordem dos quatro lotes estão em
`documentos/planos/AVALIACAO o modo montar e preciso 2026-09-14.md`; as palavras
dele, em `documentos/planos/PEDIDOS o fluxo criar e animar 2026-09-14.md`.

O caso que decide — a arma sai da mão e vai para as costas no meio da animação —
**está feito, e inteiro**. Em Animando, trocar de pai grava a chave `parent`
(§9.4) no tempo de agora, sem perguntar nada; a Árvore mostra o pai daquele
quadro; e as chaves de pose que vêm depois são convertidas para o pai novo, com
a barra dizendo quantas foram (v12.8). Ninguém é mais mandado "voltar à
Montagem": a malha e os pesos também deixaram de expulsar.

### O que fica pendente — 14/09/2026

| O quê | Onde está escrito |
|:---|:---|
| **O plano "linha do tempo — copiar e colar" fechou** (itens 11, 1, 2, 9, 6, 4 e 8, v12.6 a v13.2). O que sobrou — o gesto de arrasto para "empurrar as chaves" (um interruptor na folha, como no Spine) — é decisão do Humberto, com o Diretor | `documentos/planos/PLANO linha do tempo - copiar e colar - 2026-09-14.md` |
| **A coluna: colar na quina.** Sem dono | `documentos/planos/QUADRO ABERTO 2026-09-14.md` |
| **Malha e pesos em 1280×720: falta uma escolha do Humberto**, entre nome mais curto, coluna mais larga, ou a aba rolar como a Prévia | Este arquivo, seção "Cabe na tela grande, rola na pequena" |

---

## 15/09/2026 — o modelo das bases, e o manual da versão nova

Dia sem versão nova: **saiu o modelo do programa**, ditado pelo Humberto, e o
manual que o descreve. Tudo está em `documentos/planos/` e `documentos/manual/`.

| Onde | O quê |
|:---|:---|
| `planos/AS REGRAS DA BASE 2026-09-14.md` | **14 seções.** O modelo inteiro: a base é uma animação com o quadro 0 · cada corpo tem as animações dele · base e entidade são a mesma matéria · a entidade segue a IMAGEM, nunca o osso · a peça em laço começa onde foi solta |
| `planos/IDEIAS NOVAS - particulas e biblioteca 2026-09-15.md` | partículas como função pura do tempo; o caminho do Mixamo |
| `planos/O MANUAL - encargo 2026-09-15.md` | o manual é o **guia da versão nova**, com selo por função |
| `planos/QUADRO ABERTO 2026-09-14.md` | a seção de 15/09 tem o dia inteiro, com as cinco perguntas que são dele |
| `documentos/manual/` | 11 capítulos. O 2 e o 5 escritos do zero; os outros com selo e auditoria |

**Regra 21 da casa, nascida hoje:** onde o programa não entende, ele avisa — não
improvisa. Três casos a motivaram, e o pior foi uma **prova** que media painel
vazio e dizia "cabe".

**A lição do manual:** ele apodrece onde o código mexeu. 3 achados no capítulo
02, 6 no 04 — e as seções paradas há meses estavam certas.

## 17/09/2026 — o degrau zero está feito: a spec virou rascunho 0.2

Ordem direta do Humberto ao executor `EXECUTANDO · degrau zero`. **Só texto; o código continua congelado.** Nada mudou em `editor/`, `runtime/`, `bone.schema.json` nem no validador.

| O quê | Onde |
|:---|:---|
| A spec reescrita, seção por seção, pela lista do `ARQUITETO 3` §13 (A1–A8 como decididas) | `formato/ESPECIFICACAO 2026-09-17.md`; a 0.1 em `backup/ESPECIFICACAO_2026-09-06_rascunho-0.1-antes-do-0.2.md` |
| O glossário português ↔ JSON | spec §1.6 |
| Oito casos novos, esperado por duas contas independentes | `conformidade/casos-pendentes/C-290` a `C-297` |
| Os quatro exemplos sem socket; a pele com osso; o rig da convenção | `formato/exemplos/`, `formato/rigs/` |
| A nota "o 0.2 não abre arquivo do 0.1" | `CHANGELOG.md`, seção "Não publicado" |

**O que a spec 0.2 diz de novo, em uma linha cada:** o quadro é função pura do tempo (princípio 11; a física é a exceção escrita) · a setup pose é a **base** do corpo · o `.bonez` é o projeto do editor · a **virada** de corpo é a timeline `body` (§9.13) · a entidade **segue a imagem**, o socket saiu · a pilha de peles, **a de cima vence**, e a `default` é uma pele como as outras · `slot/bone` com `transform` · `weights` · `animation.crop` · a pele de fora traz osso · `rig.reference` ajusta a animação de fora ao tamanho.

**Provas rodadas depois:** `npm run validar -- --todos` 9 de 9 · `formato/rigs/humanoide-v1.bone` válido · `formato/rigs/lobisomem-rabo.bone` **recusado pelo validador de hoje** (não sabe que o `parent` pode vir do `rig`; regra do 0.2, degrau 1) · `npx vitest run`: **2.809 verdes, 29 pulados, 1 vermelho** — e o vermelho **não é deste lote**: `editor/testes/exportar-e-ajuda.test.ts` ("the manual page > carries every chapter") espera o capítulo `00-o-fluxo-de-trabalho.md` e dez capítulos, mas o manual foi reescrito em 15/09/2026 (`00-abrir-o-recorte.md` … `09-…`, onze arquivos, datados de 15/09 na pasta). Está vermelho desde então; a tabela lá em cima (2.810) é de 14/09. Código congelado: **não consertei**; é uma linha do degrau 1 ou do D13.

**Próximo:** degrau 1 do `ARQUITETO 4` (schema, validadores, C-270–279 sem socket, A-025/A-026 pela pilha), **só quando o Humberto disser "pode programar"**. Dois links em `site/` ainda apontam para o nome antigo da spec; é do degrau 1.

## 17/09/2026, manhã — degrau 1 feito: schema, validadores, casos e documentos no 0.2

Ordem direta do Humberto. **Runtime e editor continuam congelados.** Antes do degrau, o conserto que ele pediu: `offset` era duas coisas; a posição do anexo na chave `slot/bone` chama-se agora **`transform`**, e `offset` fica só o inteiro do `deform`.

| O quê | Onde |
|:---|:---|
| Schema do 0.2 (`$id` `bone-0.2`): entram `body`, `weights`, `slot/bone` + `transform`, `crop`, `rig.reference`; saem `socket`, `childSocket`, `rig.sockets` | `formato/bone.schema.json`; `site/validador/esquema-compilado.js` recompilado |
| Validador: referências por nome (§4.7) com as duas exceções (`rig`; corpo citado por `body`, aberto do disco ou do `.bonez`), códigos novos, avisos separados de erros; a linha de comando importa o núcleo e **abre `.bonez`** | `site/validador/nucleo.js`, `ferramentas/validador/validar.mjs` |
| Casos: C-271, C-272, C-278 apagados (cópia em `backup/degrau-1_2026-09-17_antes/`); os sete refeitos sem socket; os oito novos ficam em `casos-pendentes/` (§12.4) | `conformidade/casos-pendentes/` (16 casos: o C-298, a `default` fora da pilha, entrou às 10:20 a pedido do Chat A) |
| Documentos de conformidade no 0.2 | `conformidade/README`, `como-provar`, `how-to-prove`, `dois-runtimes`, `REGISTRY` |
| Teste novo | `ferramentas/testes/validador-rascunho-0-2.test.ts` |

**Correção à nota da manhã:** `formato/rigs/lobisomem-rabo.bone` **passa** no validador desde o degrau 1 (um `parent` vindo do `rig` conta como existente). `npm run validar -- --todos` 9 de 9; `rigs/` 2 de 2; um `.bonez` abre com três vereditos.

**Provas:** os números estão no `CHANGELOG.md`, seção do rascunho 0.2, degrau 1. O vermelho do manual (15/09) continua lá e não é deste lote.

**Próximo:** degraus 2 e 3 do `ARQUITETO 4` (runtime TS e Python), **só quando o Humberto disser "pode programar"**.

## 17/09/2026, tarde — a rodada dos degraus 2, 3 e 4a fechou (v13.4 a v13.8)

| Degrau | Chat | Versão | O que entrou |
|:---|:---|:---:|:---|
| 3 | runtime Python, só pela spec | v13.4 | §7.11 (a entidade), animações e peles de fora, a virada, `slot/bone`, `weights`, pele com osso, `rig.reference`; 16 leituras onde a spec não bastava → **Apêndice C** |
| 4a | editor sem freio | v13.5 | editar sempre grava; saem o bloqueado, o gravar sozinho, a tecla `A`, o semáforo, `Tool.modes`, o recado "é da Montagem"; o tocador nunca apaga; o interruptor da barra fica |
| 2 | runtime TS | v13.6, v13.7 | o mesmo do 3, mais o `Actor`, `body` e `slots.bone` no dump, aviso de auto-interseção da clipping; Apêndice C aplicado |
| fecho | Planejador | v13.8 | C-298, C-299, C-300; os 18 casos em `casos/`; adaptador e confronto; documentos |

**O que a rodada decidiu que o Humberto pode querer rever** (todas as escolhas são "a mais simples", delegadas): o Apêndice C inteiro, em especial `transform` valendo para todo anexo sem pesos (C 13) e `keepSkins` deixando o nome na pilha (C 10); no editor, `setSkin` continua pondo a `default` por baixo **só na tela**, até o D9 (a pilha pura está no runtime, `setSkinStack`, e é o que a conformidade mede).

**Próximo:** D4b (o documento vira projeto; a virada na tela), depois D5 ∥ D6 ∥ D7 (`ARQUITETO 4`). Só com a palavra do Humberto. Os três chats executores podem ser arquivados.


## 17/09/2026, fim da tarde — degrau 4b feito: o documento virou projeto (v13.9)

Executor `EXECUTANDO · degrau 4b` (`animador-8a`), por ordem direta do
Humberto. O runtime não foi tocado. Plano, provas e desvios:
`documentos/planos/DEGRAU 4b - o projeto de varios corpos 2026-09-17.md`.

| O quê | Como ficou |
|:---|:---|
| O projeto | `doc/projeto.ts`: vários corpos, cada um um `Doc`, **uma pilha de desfazer**. A cena e os painéis ouvem o corpo em foco; o projeto repassa o que muda nos outros |
| As listas | Corpos, Entidades e o corpo em foco em `manifest.extras.RECORTE_projeto` (spec 2.9). Nada novo no núcleo do formato |
| O corpo do instante | O documento posa pelo `Actor` do runtime (9.13). `doc.skeleton`, `doc.body`, `doc.corpo()`. A Árvore, a Ordem e as Propriedades leem `corpoDe(doc).file`: o rabo aparece só depois da virada |
| Abrir e salvar | A pasta com `manifest.json` abre como projeto (`io/project-open.ts`); Salvar grava os outros corpos e o manifesto ao lado, só quando há mais de um arquivo. O herói sozinho é igual a antes |
| Colar corpo aqui | Menu Animação: a chave `body` em `t` (`anim/body.ts`). Desfazer tira |
| A mexida estrutural | Vai para a base do corpo do instante; o rodapé diz *"(foi para a base de lobisomem)"* |
| Números | editor 2.017 · suíte 2.995 · `tsc` limpo · conformidade 71/71 · roteiro 14/14 · medição 22/22 e 15/22 |

**O que fica para os próximos degraus** (escrito na tabela de suposições do
plano): a janela Corpos · Animações do corpo (D5); o uri da chave `body` por
`skeletonsBase` e os corpos em subpasta (D10); a chave de pai e o pivô com a
virada (D7, D8). **Próximo:** D5 ∥ D6 ∥ D7, com a palavra do Humberto.

## 17/09/2026, noite — degrau 6 feito: a linha do tempo (v14.0, v14.2, v14.4)

Executor `EXECUTANDO · linha do tempo` (Chat D6), por ordem do Humberto, dentro
da rodada D5 ∥ D6 ∥ D7. O runtime não foi tocado. Encargo e desvios:
`documentos/planos/ENCARGOS degraus 5 6 7 2026-09-17.md`, seção Chat D6.

| Lote | Versão | O que entrou |
|:---:|:---:|:---|
| 1 | v14.0 | **`Ctrl` soma, `Shift` tira, sem tecla troca** (G2), no clique e no laço; `Shift` não começa arrasto; `Ctrl` + arrastar continua clonando. A dica do losango passa a dizer **o que o arrasto leva** |
| 2 | v14.2 | **A linha da virada** (`body`), o **osso do desenho** (`slot/bone`) e os **pesos** (`weights`) na folha, com nome e com **célula em degrau** |
| 3 | v14.4 | **A faixa da entidade**, com o botão direito listando as animações do filho; a **chave de sequência de imagens** |

**O achado do Spriter, escrito antes de decidir** (o Humberto pediu: *"confira
no Spriter antes"*). Manual, cap. 11 *Editing Timing*: *"arrastar quadro-chave;
**Ctrl** para pegar vários"*, e **não há modo `ripple` em lugar nenhum dele**.
O Recorte também nunca empurrou pelo arrasto — "empurrar" é o comando
**Animação → Empurrar as chaves…** (v13.1). O medo que gerou o G11 já estava
atendido; o que este degrau trocou foi **qual tecla escolhe**, e aí o Spriter e
o Humberto dizem a mesma coisa. Três testes fecham a porta, um deles pondo os
dois comportamentos lado a lado.

**Três linhas que a folha desenhava sem saber nomear.** A timeline `body`
existe desde o degrau 4b e saía com o nome **vazio**, no grupo "Geral", entre os
eventos e a ordem de desenho; `weights` saía igual; `slot/bone` saía com o
rótulo `bone` cru. Regra 21 em estado puro. Agora as três têm nome, e as que
carregam um NOME ganham célula com ele escrito: um losango diz *quando* algo
mudou e cala *para o quê*, e ler *"virou lobisomem aqui"* é o ponto inteiro
dessas linhas.

| Prova | Resultado |
|:---|:---|
| Suíte | **3.118** no fecho, com os lotes dos vizinhos dentro. Do degrau 6 vieram **+92** (linha do tempo 79→88, chaves 78→94, eixos e chaves 66→89). Nenhum teste perdido |
| `tsc` | limpo nos arquivos da parte |
| Medição | **22 de 22** de lado, **15 de 22** de altura — igual à linha de base |
| Roteiro | **11 de 14** — e os três que faltam **não são deste degrau** |
| Conformidade | **71 de 71**, nos dois runtimes. O degrau 6 não tocou `runtime/` |

**Os três passos do roteiro que caíram são do Chat D7.** O roteiro aperta `N`
para criar osso (`ferramentas/provas/roteiro-30.mjs:530`) e a tecla virou `B` na
tarefa 7.1 (`editor/src/ui/keys.ts:130-131`). O passo 5 falha sozinho; o 10 e o
11 caem em cascata, porque sem osso não há tronco para girar. É uma linha, e é
do D7. Dois testes caem pela mesma razão: `arquivo.test.ts` (*"N escolhe Criar
osso"*) e `chaves.test.ts:1023` (*"seleção mista"*, que a tarefa 7.3 mudou de
propósito). O vermelho do manual (15/09) continua lá e também não é deste lote.

## 17–18/09/2026 — degrau 5 feito: a janela Animação e o painel Entidades (v14.3 e v14.5)

Pelo executor `EXECUTANDO · janela Animação` (Chat D5), por ordem direta do
Humberto, na rodada de três chats (D5, D6 e D7) em `editor/src` ao mesmo tempo.
Encargo e desvios em
`documentos/planos/ENCARGOS degraus 5 6 7 2026-09-17.md`, seção Chat D5.

| Tarefa | Onde ficou |
|:---|:---|
| 5.1 Corpos em cima, Animações do corpo embaixo; clicar no corpo abre a base | `panels/animations.ts`, `animations-model.ts` (`listBodies`), `animations-actions.ts` (`openBody`), `doc/projeto.ts` (`trocarFoco`) |
| 5.2 Salvar como base nova (M9) | `animations-model.ts` (`bakeBaseAt`, `bodyUriFor`, `newBaseNotice`), `animations-actions.ts` (`saveAsNewBase`) |
| 5.3 Promover e rebaixar, entidade ⇄ corpo | `doc/projeto.ts` (`promover`, `rebaixar`, `guardados`), `animations-actions.ts`, e o botão direito do painel Entidades |
| 5.4 Painel Entidades ao lado do Imagens, miniatura parada | `panels/palette-entities.ts` e `palette-entities-model.ts`, estilo em `palette.css` |
| 5.5 Testes | 34 novos em `animando`, `pasta-do-projeto` e `previa`; 1 reescrito |

**O que o degrau destrancou.** O documento virou projeto no 4b, e até aqui não
havia porta para andar entre os corpos: as listas moravam no manifesto e
ninguém as via. Agora a janela Animação é a porta. Clicar num corpo troca o
corpo em foco e abre a base dele; a cena, a Árvore, a Ordem e as Propriedades
seguem junto, porque é o corpo do instante que elas já liam.

**A troca de foco não troca o objeto `Doc`, troca o conteúdo dele.** A casca
segura um documento só desde o arranque, e trocar o objeto seria remontar o
programa. Os dois documentos trocam de arquivo, atlas, ator, agulha e caminho;
quem ouve, a pilha de desfazer e o projeto ficam. A consequência disso tinha de
ser tratada, e foi: **a pilha passou a anotar o uri do corpo**, e não só o
objeto — sem isso, o passo dado no homem, desfeito depois de trocar para o
lobisomem, procuraria os ossos do homem dentro do lobisomem, e um `revert` que
não acha o que removeu não avisa nada, só não desfaz.

**Onde o programa não entende, ele avisa** (regra 21). Uma entidade que veio
montada dentro de outro `.bone` **não** é promovida a corpo: ela é um esqueleto
pronto, não um arquivo que se possa abrir. O painel tenta ler o `.bone` da raiz
da pasta do projeto; sem ele, recusa com a frase, em vez de pôr em Corpos um
corpo que não abre. A entidade sem esqueleto carregado aparece com uma
interrogação, e não com um quadrado cinza que pareceria uma peça transparente.

**O painel novo precisa de uma linha no `RIGHT_GROUPS`**, e isso se aprendeu
com um vermelho. A medição contou 11 abas onde deviam ser 12: o painel
Entidades estava no menu Janela e **não nascia na coluna**, porque a arrumação
de fábrica é o `RIGHT_GROUPS` do `ui/layout-model.ts` e o `columnFrom` só deixa
passar o id escrito lá. Uma porta prometida e não entregue — e a prova nem a
media. Está consertado, e escrito nos desvios para quem puser o próximo painel.

| Prova | Resultado |
|:---|:---|
| `npx vitest run` | **3.119** (3.089 verdes, 29 pulados, 1 vermelho antigo do manual, de 15/09) |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | 71 de 71 (nada no runtime foi tocado) |
| `npm run roteiro` | **14 de 14** |
| `npm run medir` | **24 de 24** de lado, **17 de 24** de altura — duas medições novas, e as duas cabem |
| `python ferramentas/montar-programa.py` | montado |

**Ficou de fora:** nada da tabela 5.1 a 5.5. As bordas estão na tabela de
desvios do encargo, com o degrau que fecha cada uma.

## 18/09/2026, madrugada — a rodada dos degraus 5, 6 e 7 fechou (v14.0 a v14.7)

Três chats em `editor/src` ao mesmo tempo, com cerca por parte e a fila das portas passando pelo Planejador. Encargos e desvios em `documentos/planos/ENCARGOS degraus 5 6 7 2026-09-17.md`.

| Degrau | Chat | Versões | O que entrou |
|:---|:---|:---:|:---|
| 5 | janela Animação | v14.3, v14.5 | Corpos em cima, Animações do corpo embaixo; clicar no corpo abre a base; Salvar como base nova; promover e rebaixar; o painel Entidades (miniatura parada, arrasto próprio) |
| 6 | linha do tempo | v14.0, v14.2, v14.4 | Ctrl soma, Shift tira, Ctrl+arrastar clona (conferido no Spriter: sem ripple); a linha da virada; `slot/bone` e `weights` na folha; a faixa da entidade com o botão direito; a chave de sequência |
| 7 | cena, árvore e malha | v14.1, v14.6 | B cria osso, Y posa, N livre; a Malha pega caixa, máscara e caminho; botão direito com porta no menu; o desenho troca de osso por chave `slot/bone` com `transform` **num desfazer só**; pendurar cria tomada; Chavear pesos; forma e pesos para a base do corpo do instante, avisando quantas chaves `deform` antigas passam a cair noutros vértices |
| fecho | Planejador | v14.7 | CHANGELOG reordenado; `versao.py` recusa número repetido em qualquer data; regra do `layout-model.ts` |

**Para o Humberto ver na tela:** um projeto de dois corpos, a animação `transformar`, a linha "Virada de corpo" na folha, a faixa da entidade, e Virar filho com um desenho no meio da animação sem o desenho saltar.

**Próximo:** D8 ∥ D9 ∥ D10 (Imagens · Ordem · Entidades; Peles; Arquivo), pelo `ARQUITETO 4`. Só com a palavra do Humberto. Os cinco chats parados (4b, D5, D6, D7 e os três da rodada anterior) podem ser arquivados.

## 18/09/2026, manhã — a rodada dos degraus 8, 9 e 10 fechou (v14.8 a v15.8)

Três chats em `editor/src` ao mesmo tempo, de novo. Encargos e desvios em `documentos/planos/ENCARGOS degraus 8 9 10 2026-09-18.md`.

| Degrau | Chat | Versões | O que entrou |
|:---|:---|:---:|:---|
| 8 | imagens, ordem e entidades | v15.0, v15.3, v15.7 | a grade do botão direito lista entidades e a troca herda osso, pivô, ordem e chaves; copiar a ordem chave a chave; pasta numerada vira sequência; Trocar pasta de origem; o PSD pela guia; o painel **Pivôs**, que cabe nas duas telas; a ordem base segue a pilha |
| 9 | peles | v14.9, v15.1, v15.4, v15.5 | **Feitas e Ativas** no lugar do olho, a de cima vence, a `default` pode sair; `pilha` e `emEdicao` no estado do editor (o `skins` velho ainda é gravado, para trás); um lápis só, com sinal na Árvore e na cena; a pele de uma pasta inteira; **Exportar / Importar pele** com osso; **Promover pele a base**; `keepSkins` na ficha da chave `body`; defeitos A4, A5, A6 |
| 10 | arquivo | v14.8, v15.2, v15.6 | Novo, Abrir e Salvar falam de projeto e corpo; Salvar grava a pasta inteira; **Salvar como pacote**; **Entregar um corpo**; abrir outro `.bone` como corpo ou entidade; salvar a entidade pergunta Novo ou Por cima; exportar imagem com as duas opções de recorte e o magenta; o Spriter vira projeto; o glTF recebe um corpo; a exportação segue a pilha |
| fecho | Planejador | v15.8 | as duas sobras da `default` encaminhadas aos donos; a regra "ninguém grava enquanto alguém prova"; provas com todos parados |

**O bolo do `ARQUITETO 4` está quase todo no forno:** feitos D0 a D10. **Falta o D11** (a casca: o interruptor sai da barra, o sistema de trocar teclas, colar na quina, arranjos com nome, a tela cheia da Visualização, a Janela de Problemas), que o Humberto pediu para fazer **com ele vendo**. Depois o D12 (glacê: partículas, biblioteca, portas do formato) e o D13 (o manual, só quando ele pedir; os 29 testes pulados e o vermelho do manual são dele).

**Próximo:** D11, só com a palavra do Humberto, e com ele na frente da tela. Os três chats desta rodada estão parados e podem ser arquivados.

## 18/09/2026 — degrau 11 feito: a casca (v16.0 a v16.7)

Pelo executor `EXECUTANDO · a casca`, num chat só, com o Humberto pedindo para
fazer **vendo**: **um lote por mudança visível, uma versão por lote e um par de
fotos por lote** (`backup/fotos-degrau-11/`, 17 fotos). Encargo e desvios em
`documentos/planos/ENCARGO degrau 11 - a casca 2026-09-18.md`.

| Lote | Versão | O que entrou |
|:---:|:---:|:---|
| 1 | v16.0 | **O interruptor sai da barra**, e o `Ctrl+Tab` com ele. O rodapé diz *"Base: heroi"* ou *"Animação: andar"*, e a dica diz por onde se troca. `EditorMode` saiu do contrato. A base abre pelo clique no corpo ou por **Animação → Abrir a base** |
| 2 | v16.1 | **Trocar as teclas** (G7): o lápis na Ajuda → Atalhos troca a tecla, vale na hora, fica na máquina (`RECORTE_teclas`), a trocada aparece marcada com a de fábrica ao lado, e **o conflito avisa e não troca**. Tecla que o programa lê direto do teclado aparece como **fixa** |
| 3 | v16.2 | **Colar na quina** (C1): o painel flutuante encosta nas quinas e bordas da cena, com a **sombra antes de soltar**. A quina fica guardada: a janela muda de tamanho e ele continua lá |
| 4 | v16.3 | **Arranjos com nome** no menu Janela (C6), com **Pivô** e **Visualização** de fábrica. Dois consertos no caminho: o menu passou a **rolar** e o submenu a **flutuar** |
| 5 | v16.4 | **A tela cheia da Visualização** (C5) com a lista de animações e as peles dentro; `Esc` volta. Pôr e tirar pele ali é **teste**: não mexe no arquivo |
| 6 | v16.5 | **A Janela de Problemas**: o que está errado por extenso, o Ir para, e **o conserto com o nome escrito** onde há conserto. Portas: o botão de avisos e **Ajuda → Problemas do arquivo…** |
| 7 | v16.6 | **A1**: o rascunho que falha ao gravar **avisa** (uma vez). **A2**: a janela de recuperar tem os três caminhos escritos, e **fechar nunca apaga** |
| 8 | v16.7 | **A10**: a medição mede o painel **cheio**. Painel vazio não conta como medido, e os números pioraram — estão escritos abaixo |

| Prova | Resultado |
|:---|:---|
| `npx vitest run` | **3.340** (3.310 verdes, 29 pulados, 1 vermelho antigo do manual, 15/09) |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | **71 de 71** (o runtime não foi tocado) |
| `npm run roteiro` | **14 de 14** — o passo 14 foi reescrito e passou a provar o A2 |
| `npm run medir` | **26 de 26** de lado, **19 de 26** de altura, agora com os painéis CHEIOS |

**Os números da altura pioraram, e é por honestidade.** Medido com o desenho
escolhido e a animação aberta — o que o Humberto de fato vê —, faltam
**265 px** em Propriedades (eram 68) e **567 px** em Malha e pesos (eram 445),
em 1440×900; em 1280×720, **387 px** e **689 px**. A conta de quantas cabem
ficou igual por coincidência: as medições que eram falso verde passaram a ser
medidas de verdade **e cabem**.

**A escolha de Malha e pesos em 1280×720 continua sendo do Humberto** (nome
mais curto, coluna mais larga, ou a aba rolar como a Prévia): ver a seção
"Cabe na tela grande, rola na pequena", mais acima. O número de lá era o de
painel vazio; o de agora está nesta seção.

**Próximo:** D12 (o glacê: partículas, biblioteca, portas do formato) e D13 (o
manual, com os 29 pulados e o vermelho de 15/09). Só com a palavra do Humberto.

## 18/09/2026, tarde — degrau 12, rodada R1: a biblioteca e as partículas no formato

Encargo: `documentos/planos/ENCARGOS degrau 12 - o glace 2026-09-18.md`.
Três chats, cercas que não se cruzam. Duas partes fecharam.

| Parte | Versões | O que ficou pronto |
|:---|:---|:---|
| **Biblioteca de animações** | v17.0, v17.3 | **Exportar** e **Importar animação**, com o `rig` gerado do conteúdo e a lista do que falta **por extenso, antes de aplicar**; e as quatro de fábrica — parado, andar, correr, pular — em `formato/rigs/humanoide-v1-animacoes.bone`. O `humanoide-v1.bone` não mudou |
| **Partículas no formato** | v17.1, v17.2, v17.4, v17.5, v17.6 | A extensão **`BONE_particles`**: spec, JSON Schema, exemplo, convenção e registro; os cinco códigos de validador; os **oito casos** em `casos-pendentes/`; e o validador conferindo o **`rig`** |
| **Portas do formato** | — | começou pelos Sliders |

**Medido pelo Planejador `dd3937`:** suíte **3.496** (3.466 verdes, 29 pulados,
1 vermelho antigo do manual) · `tsc` limpo · conformidade **71/71 nos dois
runtimes**. Roteiro e medição: no fecho da rodada, com a casa vazia.

## 22/09/2026, madrugada — cinco chats, dezessete versoes, e o que elas ensinaram

Ordem do Humberto, 21/09: *"Voce mexe, mexe, mexe, e parece que esta fazendo
alguma coisa, mas eu nao vejo isso no aplicativo. O carro sem o volante."*

**Ele tinha razao, e a regra que saiu dali mandou na noite inteira:**

> **LOTE SEM FOTO NAO FECHA.** Se nao da para fotografar, nao e entrega: e
> preparo, e preparo nao conta como progresso.

### O que ele pode ver

| Versao | O que |
|:---|:---|
| **v20.8** | **A pele entra no personagem.** Arrastar para Ativas punha a pele **embaixo**, o rodape dizia "ligada" e nada mudava. Agora entra no topo — e se ela cair onde nada dela aparece, o rodape **diz isso**, com o nome de quem cobre |
| **v21.0** | **Desfazer nao corrompe mais o arquivo.** Criar osso, duplicar, desfazer duas vezes deixava o osso no arquivo e o validador acusava. Eram **oito** lugares, nao quatro |
| **v21.3** | **"Regra..." abre a janela** em vez de fechar a aba. E com a aba fechada, deixou de nao fazer nada em silencio |
| **v21.4** | **Ctrl+K no meio de uma curva nao estraga mais o movimento.** A curva e partida em duas que desenham a mesma coisa (De Casteljau) |
| **v21.8** | **Flash, pulso e tremor** — tres efeitos que gravam **chaves comuns** e somem. Menu Animacao > Efeitos |
| **v21.9** | **O emissor de particulas existe**, com icone proprio e ficha |
| **v22.1** | **A folha "o que o programa faz"** — 200 tarefas na lingua dele, geradas do codigo |
| **v22.4** | **A busca acha pela DICA.** Digitar `zipa` acha "Salvar como pacote". 55 dicas que ja estavam escritas e ninguem tinha ligado a busca |
| **v22.5** | **A folha do Aseprite entra arrastando.** Antes, o `.json` dava "nao sei de que programa e" **e o PNG era jogado fora** |

### O que mudou por dentro, e ele nao ve

| Versao | O que |
|:---|:---|
| **v20.9** | O **vigia do comando sem porta**: 187 coisas editam o documento, 14 sem porta, cada uma com motivo escrito |
| **v21.2 / v21.6 / v22.0 / v22.2** | Mais **tres reguas**, cada uma pegando um silencio diferente |
| **v22.3** | A barra de espaco deixa de depender de um acidente da casca. **Nao ha o que ver, e esta escrito** |

### As cinco camadas do mesmo defeito, numa noite so

| # | A camada | Achada por |
|:---:|:---|:---|
| 1 | o **comando** existe e nenhum menu o chama | o vigia |
| 2 | a **acao** nao existe porque o painel nao montou | o chat dos defeitos |
| 3 | o **corpo** da acao roda e nao faz nada | o mesmo, consertando a 2 |
| 4 | o **teste** roda e nao exercita | a quarta regua |
| 5 | a **conta** esta certa e nao pinta nada | o chat dos efeitos, no flash |

A quinta e a mais funda: um flash escrito na cor que **multiplica** deixaria o
arquivo maior, o teste verde, e **a foto igual a de antes**.

### O que a foto achou e teste nenhum achava

**Duas vezes na mesma noite:**

- **Toda dica de item de menu ligado estava invisivel desde 18/09.** A dica
  existia, escrita certa, e nao chegava aos olhos. Achada por alguem indo
  fotografa-la e nao a encontrando.
- **A ficha do emissor nao chegava aos olhos** num painel curto: caia abaixo da
  borda. Testes verdes.

### As reguas que ficaram, todas de erro medido

| | |
|:---|:---|
| **Um arquivo que some e pior que um arquivo errado** | o que fica, alguem le e conserta; o que evapora faz a pessoa duvidar da propria medicao (regra 29) |
| **Chamar nao e exercitar**, como **existir nao e funcionar** | contar como provado o que so foi chamado |
| **Uma lista que ESQUECE deixa buraco; uma que ABSOLVE faz quem vem depois nao olhar** | a varredura de 19/09 pos um arquivo culpado numa coluna chamada "nao e a forma", e o Planejador confiou nela duas vezes |
| **Guardei uma chave que o proprio programa pode reescrever** | e a receita do Planejador — *"ache por nome"* — consertava metade |
| **O arquivo de exemplo rico esconde o caso vazio** | o heroi tem 20 slots; nenhum teste partia de um arquivo sem nenhum |
| **Toda medida que passa por um intermediario decidido em tempo de execucao nao prova o que esta do outro lado** | a tecla, o foco, a ferramenta na mao |
| **Todo instrumento que se mede junto com o que mede da verde** | o vigia nasceu dizendo "zero", e o zero era ele se contando |
| **Todo fecho de versao ja e uma linha de base** | e quem a criou nao estava usando a sua |

### Uma coisa que ninguem tinha escrito, e toca toda prova futura

> **A cena do editor NAO e funcao pura de `t`.** Arrastar a agulha para tras e
> voltar **nao** devolve o mesmo desenho do heroi.

Achado pelo chat das particulas, medindo a ida-e-volta da agulha: a prova dizia
"quadro diferente", e a culpa ia cair na peca nova. Ele mediu de novo **sem
emissor nenhum** e achou os **mesmos 561 pixels** mudando, na mesma caixa: e o
**cabelo e a capa**, que andam numa regra de **fisica** — e fisica guarda estado
**de proposito**, o que o runtime diz por escrito.

**A extensao das particulas foi escrita para ser o contrario disso** (funcao
pura, semente fixa, arrastar para tras da o mesmo quadro), e por isso a confusao
era facil.

**O que isso muda:** qualquer prova futura que compare **fotos da cena** entre
dois instantes tem de descontar a fisica, ou medir com ela desligada. Toca a
casca de cebola e o `medir -- --fotos`.

**E a forma, para a casa varrer:** *medi o palco inteiro e culpei a peca nova.*
A metade que fecha: **a regua do instrumento nao vai dentro do preparo do
passeio** — um segundo passeio parte de um estado de fisica diferente do
primeiro e da outro numero (618 com emissor, 1543 sem, na mesma pagina).

### O que ficou aberto, escrito e nao escondido

- **As particulas na cena** (o lote 2 do emissor) — e o que ele mais quer ver.
- As `frameTags` do Aseprite lidas e nao viradas em animacao: **duas decisoes
  dele**, nao codigo.
- As 69 acoes de `casca` sem exigencia de efeito; a quinta regua; a tecla que
  cala, decidida e nao feita.
- **Quatro decisoes de tela** esperando ele: a palavra "Etiqueta" - "Paleta de
  comandos" virar "Procurar um comando..." - as teclas de painel na Ajuda - os
  doze botoes da aba Regras.

## 18/09/2026, noite — o degrau 12 fechou: partículas, biblioteca e as portas

Cinco chats, dezoito versões (v17.0 a v20.1), e **os 17 casos de partícula
entraram na suíte oficial**: a conformidade passou de **71 para 88 casos**, com
`P: 17/17`, nos dois runtimes.

| Parte | O que ficou pronto |
|:---|:---|
| **Partículas** | A extensão **`BONE_particles`**, 1ª fase: spec, schema, validador, e os **dois runtimes** lendo-a — TypeScript e Python, escritos ao mesmo tempo **sem um olhar o outro** |
| **Biblioteca** | **Exportar** e **Importar animação**, com a lista do que falta **antes** de aplicar; e as quatro de fábrica (parado, andar, correr, pular) contra o `humanoide-v1` |
| **As portas** | **Sliders** (com o conserto do driver que nunca rodava) · **áudio de eventos** (o editor não tocava som nenhum) · **física** com Simular, Reiniciar e **Assar em chaves** · **variáveis e etiquetas**, com o desligar que continua dizendo o que existe |
| **A prova** | A medição passou a medir o painel **com uma regra escolhida** — e o número honesto de Propriedades saltou de 290 px para **707 px** |

### Doze pontos cegos, num texto de 35 KB escrito com cuidado

Nenhum deles aparecia em teste nenhum, e **os dois runtimes passavam os oito
casos originais** enquanto desenhavam coisas diferentes. O confronto inteiro
está em `documentos/planos/CONFRONTO dos dois runtimes - particulas 2026-09-18.md`.

| Achado por | O quê |
|:---|:---|
| O confronto | a fórmula do ponto no triângulo · a ordem do `spherizeDirection` · a tolerância do `angle` |
| Escrever as linhas | a rajada nas voltas de trás · o corte dos ciclos além de `D` · o `startDelay` (a palavra aparecia **uma vez** na spec, em nenhuma fórmula) · o relógio do `emitting` |
| Escrever os casos | a **ordem** da lista de arestas · `oldestInFront` invertendo o desempate · **cortar antes de ordenar** |
| **Um caso reprovando os dois runtimes** | a §4.2 somava o `startDelay` no fim em vez de deslocar a origem — e fazia nascer partícula com a torneira fechada |
| **Um chat varrendo o próprio código** | os índices pulando depois de um vão: a mesma partícula com **dois nomes** |

### O que este degrau ensinou sobre provar

Seis réguas, todas nascidas de erro medido, não de conselho:

| # | A régua | De onde veio |
|:---:|:---|:---|
| 1 | **Antes de provar que consertou, prove que o defeito existia** | três chats, no mesmo dia: o osso tirado do contrato para ver a regra acusar · a ida e volta antes de assar · a ordem virada ao contrário para ver o teste falhar |
| 2 | **O número esperado vem da conta, nunca do gerador** | dois casos nasceram errados e só foram pegos porque o número tinha sido calculado à mão ANTES |
| 3 | **Escrever a conta por extenso é o que revela que não se estava fazendo assim** | quem escreveu a regra do corte na spec descobriu, ao escrevê-la em duas etapas, que não a seguia |
| 4 | **Uma ordem de forma sem a semântica junto produz uma frase bem escrita e errada** | o Planejador mandou "escreva por extenso" e não disse o que a expressão devia significar |
| 5 | **Você só testa o que já lhe ocorreu olhar** | a mutação prova que o teste pega o que ele olha; não prova que olha para o lugar certo. Quem aponta para fora é o **caso**, escrito por quem não escreveu o runtime |
| 6 | **Descreva o próprio erro pela FORMA, não pelo estrago — e então todo mundo vai procurar aquela forma na própria casa** | aconteceu duas vezes: um chat leu "o teste deu verde falso" e foi conferir o dele; outro leu "somei em vez de integrar" e foi achar onde somava. **A régua tem duas metades, e a primeira é a que ninguém lembra:** sem alguém nomear a forma em voz alta, não há forma que se possa procurar |

**E uma frase para todo caso de fronteira daqui para a frente:** *uma amostra
prova a regra; duas provam onde ela vira.*

### Os três erros do dia não pesam igual

Fecho da rodada, e a distinção é de quem cometeu o maior deles:

> **Gesto errado quebra alto. Texto errado passa a ser copiado.**

| O erro | Como apareceu | Quanto durou |
|:---|:---|:---|
| O Planejador moveu uma pasta sem varrer quem a lia | **139 vermelhos**, na hora | minutos |
| O Planejador moveu um caso sem ler o que ele dizia sobre si | achado na varredura seguinte | minutos |
| **Uma frase errada na spec** (a §4.2 somando em vez de deslocar a origem) | **nada quebrou** | **da v19.2 à v20.1**, passando pelo Planejador, por quem a escreveu e pelos **dois** runtimes |

O texto errado só caiu porque **um caso o separou** — e o caso existia só porque
alguém decidiu escrever prova para o que nenhuma prova cobria. É por isso que
estas réguas protegem mais o que se escreve do que o que se faz: **o gesto
errado avisa sozinho; o texto errado é obedecido.**

### Um trabalho que fica escrito, e ninguém começou

A régua mais afiada do dia — **"por que este verde é explicável?" e "o que este
verde prova?" são perguntas diferentes** — nasceu de um **caso**, e num caso ela
é fácil de aplicar: o nome está na tabela do relatório, e a mentira é legível
(*"P-002 taxa em rampa: passou"*, sem exercitar rampa nenhuma).

**Num teste é muito mais difícil, e é onde há mais material:**

> O nome de um teste só aparece quando ele **falha**. Um teste verde que prova
> outra coisa que não o nome dele **nunca é lido por ninguém**.

São milhares de testes verdes nesta casa. Nenhum foi relido com essa pergunta —
nem os 95 que o próprio chat do runtime TypeScript escreveu hoje, e foi ele
quem levantou isto, sabendo que ninguém perguntaria. **Fica como varredura
futura, para quem tiver fôlego**, e não como dívida escondida.

---

### Três coisas da rodada R1 que valem mais que o código

| O quê | Por quê importa |
|:---|:---|
| **O validador dava verde para lixo.** O schema de uma extensão nunca era consultado: um emissor com taxa negativa, forma inventada e semente inválida passava nos dois validadores. Agora o schema é aplicado **pelo nome**, e ele **diz de si mesmo o que descreve** — extensão nova entra sem uma linha de código | §12.7 já mandava, e ninguém tinha feito |
| **Escrever os oito casos rendeu três linhas novas à spec**, cada uma sobre algo que dois leitores teriam adivinhado diferente | É a regra de empate agindo **antes** de custar um caso, e não depois, como custou o C-299 e o C-300 |
| **"Zero, sozinho, não prova nada."** A regra nova do `rig` não acusou nenhum dos 110 arquivos do projeto — então o executor plantou o defeito de propósito, viu a regra acusar, devolveu o arquivo, e prendeu a medição **num teste** que varre o projeto e diz qual arquivo | Uma regra que nunca acusa nada também dá zero. É a regra 21 aplicada à própria prova: a cara que engana **a nós** |

**O buraco que o `rig` no validador fechou:** um arquivo de animação com o
contrato incompleto **parece são sozinho** — o osso está lá dentro — e chega
quebrado no hospedeiro, porque os `bones` de um arquivo importado são
ignorados. Quem publica nunca descobria. Osso `skinRequired` e slot local se
descontam (viajam com a pele); osso comum, não.

## 18/09/2026 — degrau 12, parte `B`: a biblioteca de animações ganha as duas portas (v17.0)

Pelo `EXECUTANDO · biblioteca de animacoes`, lote 1 do encargo do glacê.

🗣️ *"o que você acha do Mixamo?"* — levar a animação para outro personagem. O
formato e os dois runtimes já faziam isso inteiro desde o degrau 2 (§2.8
`assets.animations`, §4.8 `rig`, `RIG_UNMET`, `rig.reference`, e os casos C-275,
C-276, C-277, C-279, C-294 e C-297). **O buraco era só a tela**: o editor
exportava e importava pele, e não exportava nem importava animação.

| Porta | O que ela faz |
|:---|:---|
| **Animação → Exportar animação…** | as marcadas saem num `.bone` com o `rig` **gerado do conteúdo** e o `rig.reference` da convenção do corpo |
| **Animação → Importar animação…** | o uri entra em `assets.animations`, e **a lista do que este corpo não tem aparece por extenso ANTES de aplicar** |

O arquivo novo é `editor/src/io/export-animation.ts`, escrito contra o
`io/export-skin.ts` linha a linha: são as duas metades da mesma frase da §2.8, e
quem os ler lado a lado vê a mesma forma.

**O lote 2 fechou na v17.3:** as quatro animações de fábrica — **parado, andar,
correr, pular** — em `formato/rigs/humanoide-v1-animacoes.bone`, gravadas contra
a convenção. O `humanoide-v1.bone` **não mudou**: o `animations: []` dele é
vazio de propósito, e o `extras` dele já dizia que as de fábrica viriam num
arquivo gravado *contra* ele.

**Onde elas aparecem** (decidido olhando os três programas, regra 9; o que cada
um faz está nos Desvios do encargo): segue o **Spine**, que importa animação
para dentro do esqueleto aberto e a põe na lista normal. A porta é um botão em
ícone na janela Animação — **Biblioteca de animações** — mais o item de menu, e
o que chega aparece na mesma janela, numa seção **De fora**. O Spriter não
importa animação nenhuma; a biblioteca do DragonBones é a de imagens.

**A regra 21 em dois lugares novos:** a lista do que este corpo não tem aparece
por extenso **antes** de trazer, com o fator de tamanho como número (`k = 2,000`,
não "vai ficar bom"); e a seção "De fora" **escreve que não sabe** os nomes de um
arquivo externo que o editor não abriu nesta sessão, em vez de mostrar zero e
parecer uma importação que não pegou.

**Um buraco achado no caminho, que não é desta parte:** o
`ferramentas/validador/validar.mjs` e o núcleo dele (`site/validador/nucleo.js`)
**não conferem o `rig`** (`RIG_UNMET` não aparece em nenhum dos dois, e
`RIG_INCOMPLETE` não existe em lugar nenhum do código vivo), embora a §4.8 o
exija. Subiu ao Planejador e virou o lote 4 do `P1`. Até ele fechar, a janela de
importar é o único lugar onde alguém vê que um nome de osso não bate.


## 18/09/2026, 10:45 — o degrau 11 conferido pelo Planejador; a próxima rodada muda de janela

Conferido com o executor parado: suíte 3.340 (1 vermelho, o do manual), `tsc` limpo, 71/71 nos dois runtimes, roteiro 14/14, medição 26/26 e 19/26 com painel cheio. Fotos dos oito lotes em `backup/fotos-degrau-11/`. **Feitos os degraus D0 a D11.** Falta o D12 (o glacê) e o D13 (o manual, só quando o Humberto pedir).

**O D12 é do `PLANEJADOR · dd3937`**, que já escreveu `documentos/planos/ENCARGOS degrau 12 - o glace 2026-09-18.md`. A janela `PLANEJADOR · animador-5e` se cala aqui e pode ser arquivada. Pergunta aberta ao Humberto: as teclas de painel entram na janela Ajuda → Atalhos?

## 22/09/2026, madrugada — flash, pulso e tremor: os três "só porta" (v21.8)

Pelo `EXECUTANDO · flash, pulso e tremor`. Os itens 2 e 4 da tabela de
`COMO SE FAZ EFEITO 2026-09-16.md` §6 saíram: **Animação → Efeitos**, com
Flash…, Pulso… e Tremor…

| Onde | O quê |
|:---|:---|
| `editor/src/anim/efeitos.ts` | a conta inteira, módulo puro: `planoDoFlash`, `planoDoPulso`, `planoDoTremor`, `aplicarPlano`, e o `pcg`/`acaso` da §3.2 |
| `editor/src/ui/efeitos-actions.ts` | as três portas, de arranque. `anim/` é degrau 1 e não pode importar o registro de ações |
| `editor/testes/efeitos.test.ts` | 30 casos, incluindo a regra de ouro e as portas sem painel montado |
| `backup/fotos-efeitos/` | o par do lote, mais a foto do submenu aberto |

**Nada de campo novo.** Os três gravam chaves comuns e somem: a lista de campos
de primeiro nível do arquivo é a mesma antes e depois, e as chaves não carregam
nada além de `time`, `value` e `curve`. A montagem não é tocada.

**A escolha que decide o lote:** o flash grava `darkColor`, e não `color`. Pela
7.12, `dark = (1,1,1)` leva o pixel a branco puro seja qual for a textura;
`color` multiplica, e branco sobre arte clara não mudaria um pixel. Seria a
ação existir, o arquivo crescer, o teste ficar verde e **a tela continuar
igual** — *"existir não é funcionar"* na conta, não no comando.

**O que ainda não saiu da tabela §6:** a folha animada entrando arrastando
(item 1), o efeito como arquivo próprio encaixado no boneco (item 3), o emissor
sem estado (item 5, campo novo — decisão do Humberto) e o UV que corre (item 6,
shader).

## 22/09/2026, madrugada — a folha animada do Aseprite entra arrastando (v22.5)

Pelo `EXECUTANDO · flash, pulso e tremor`. O item 1 da §6 fecha: **pasta
numerada OU folha do Aseprite → `sequence`**.

**A metade da pasta já existia** (degrau 8, tarefa 8.6) e não foi reescrita. A
metade da folha é nova, e desemboca na mesma: os quadros saem nomeados na
convenção da §7.10, e o `numberedSequence` os reconhece sem uma linha nova.

| A diferença entre as duas, e é toda ela |
|:---|
| A **pasta** traz N imagens: cada uma vira uma página de UMA região |
| A **folha** traz UMA imagem: ela vira uma página de N regiões |

**Nenhuma conversão de eixo:** a §10.1 põe a origem da região no canto superior
esquerdo, Y para baixo — o sistema do Aseprite. A única conta é o `offsetY` do
quadro **cortado**, que o formato conta de baixo e o Aseprite conta de cima.

**O `.json` é desempatado pelo CONTEÚDO, nunca pela extensão:** Spine,
DragonBones, o `.scon` do Spriter e o atlas do Recorte terminam todos em
`.json`. Com várias imagens e nenhuma de mesmo nome, o programa **não adivinha**
qual é a folha.

**O que fica de pé para quem vier:** as `frameTags` do Aseprite são lidas e
carregadas (`sheet.tags`), mas **ainda não viram animação**. Uma etiqueta
`queimando` de 0 a 3 é uma animação pronta com chaves de `sequence` — é o
próximo passo natural, e não foi feito neste lote.

## 29/09/2026, 05:00 — Evento e Parâmetro têm linha na Árvore (v23.1)

Chat D da rodada final, lote 1. O grupo **"Eventos e parâmetros"** fica no fim
da Árvore, como o nó `Events` do Spine. Quem cria pelo `Novo ▾` vê o novo
escolhido e à vista, e o rodapé diz onde ele está.

| Ainda aberto, da mesma parte | Onde |
|:---|:---|
| a ficha do parâmetro abre abaixo de "Compensar" em Propriedades | `DEFEITOS achados no uso 2026-09-28.md`, D1 (chat B) |
| o evento não tem comando de apagar | ninguém pediu ainda: o menu diz onde fica a ficha, e não finge um apagar |

## 04/10/2026 — o projeto foi decidido, e a obra volta por rodadas

Sem versão nova: a **v23.3** continua a última, e nenhum código mudou desde 29/09.

O Humberto fechou o projeto do programa em 03 e 04/10. **Nada sai: tudo fica.** O trabalho é dar a cada coisa o seu lugar e fazer funcionar.

| O quê | Onde |
|:---|:---|
| O que o programa tem de ser (base, conexão, skin, tela, partículas, entrega) | `documentos/projeto do programa/02 AS DECISOES do projeto 2026-10-04.md` |
| A ordem da obra, em rodadas pequenas, **um chat por rodada** | `documentos/projeto do programa/03 A ORDEM DA OBRA 2026-10-04.md` |

**Quem chega agora começa pelo `03`.** Os planos de `documentos/planos/` passam a ser história. Um **Diretor** (`DIRETOR · ed2cab`, desde 04/10) fala com o Humberto, confere cada rodada usando o programa e escreve a seguinte; cada rodada é um chat novo. Não há Planejador. Os 18 chats da rodada final foram arquivados em 04/10.
