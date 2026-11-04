# Encargos da rodada — degraus 8, 9 e 10 — 18/09/2026

Escrito pelo **PLANEJADOR · animador-5e**, por ordem do Humberto ("continue"),
depois do fecho da rodada 5/6/7 (v14.7). **A peça vive neste arquivo; a
mensagem é só o resumo.** Quem perder o contexto lê: `CLAUDE.md` ·
`documentos/QUEM E QUEM.md` · `ESTADO.md` · este arquivo · o seu degrau no
`ARQUITETO 4` · `editor/src/contract.ts` inteiro · `documentos/PARTES.md` ·
`ENCARGOS degraus 5 6 7` (as regras aprendidas, no fecho) ·
`DEGRAU 4b - o projeto de varios corpos` (suposições 1, 2 e 12 são desta rodada).

**Linha de base:** v14.7 · suíte 3.119 (3.089 verdes, 29 pulados, 1 vermelho
pré-existente do manual, 15/09, que **não é seu**) · `tsc` limpo · conformidade
71/71 · roteiro 14/14 · medição 24/24 e 17/24.

## O caminho

```
Chat D8 / D9 / D10  →  PLANEJADOR (animador-5e)  →  Humberto
```

Dúvida sobe por `SendMessage` para `animador-5e` (o canal por onde você
recebeu a primeira mensagem). **Nenhum chat abre painel de pergunta** (regra
23): escreva a suposição no fim deste arquivo, na sua seção, e siga. Ao abrir:
`ListAgents`, título pela regra 22 (`EXECUTANDO · imagens, ordem e entidades`,
`EXECUTANDO · peles`, `EXECUTANDO · arquivo`), e a sua linha em
`documentos/QUEM E QUEM.md`.

## As cercas (três chats em `editor/src` de novo)

| Regra | |
|:---|:---|
| **Cada um na sua parte.** D8: `panels/palette*`, `image-picker.ts`, `image-grid-model.ts`, `pivot-model.ts`, `pivot-dialog.ts`, `draw-order-model.ts`, `panels/draw-order*`, `io/project-folder.ts`, `ferramentas/src/importar/psd.ts`. D9: `panels/skins*`, `skins-model.ts`, `skins-actions.ts`, `onion.ts`, `rules-model.ts`, `properties-model.ts`, `io/export-skin.ts`. D10: `shell-file.ts`, `io/open-save.ts`, `io/folder-save.ts`, `drop-plan.ts`, `export-image.ts`, `export-gltf.ts`, `ferramentas/src/importar/spriter.ts`, `viewport-draw.ts` só para o retângulo magenta | fora da sua parte, só arquivo de passagem, e só **acrescentando** |
| **Arquivos de passagem** (só acrescentando, relendo do disco antes de gravar): `contract.ts`, `main.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `layout-model.ts`, `tree-rows.ts`, `viewport-draw.ts`, `open-save.ts` (para D8 e D9), `drop-plan.ts` (para D8), `palette.ts` (para D9) | `fronteiras.test.ts` e o teste de conflito julgam |
| **Painel novo precisa de uma linha em `layout-model.ts` (`RIGHT_GROUPS`)**, senão não nasce na coluna e a medição não o mede | aprendido no D5 |
| **Asserção que prova comportamento de outro chat é do outro chat**, mesmo no seu arquivo de teste: avise o PLANEJADOR, que encaminha; o dono reescreve só ela | aprendido na rodada 5/6/7 |
| **Testes:** durante o lote, só os da sua parte. A suíte inteira só no fecho. Vermelho na parte de outro: não conserte, avise | a contagem nunca cai |
| **Portas fixas** (`npm run roteiro`, `npm run medir`): **um de cada vez**. Mande "vou rodar o roteiro" ao PLANEJADOR e **espere o "PODE"**. Se em cinco minutos não vier, mande de novo pelo canal por onde você falou; a fila da janela às vezes segura | aprendido na rodada 5/6/7 |
| **Backup** antes de escrever: `backup/editor-src_2026-09-18_antes-do-degrau-N/`, linha no `INDICE.md`. **Versão** por lote (`versao.py`, próximo livre; recusa repetido em qualquer data), subtítulo no `CHANGELOG.md` **acima do mais novo que houver na hora** (releia antes). No fecho, `montar-programa.py` | regras 1, 3, 14, 15 |
| **Onde o programa não entende, ele avisa** (regra 21). Botão novo nasce em ícone, com nome na dica. **Olhar os três programas antes** (Spriter, Spine, DragonBones) em gesto novo, e seguir o modelo | regras 12, 21; memória do Humberto |
| Terminou: mensagem curta ao PLANEJADOR (versão, números, o que ficou de fora) e **pare** | |

## Modelos

Os três em **Opus** (o Planejador troca logo depois do clique).

---

## Chat D8 — Imagens · Ordem · Entidades (degrau 8)

**A ordem, na voz do Humberto:**

> Execute o degrau oito, só ele. Imagens, Ordem e Entidades: a grade do botão direito lista entidades, e trocar imagem por entidade herda osso, pivô, ordem e chaves; copiar a ordem chave a chave; Trocar pasta de origem, com um desfazer e aviso de nome repetido; alinhar a imagem pela guia do PSD, e sem guia pela tela; o painel Pivôs, a pasta inteira em grade com a cruz, sem janela que tranca; pasta numerada vira sequência. Reescreva os testes, a contagem não cai. Não toque no runtime. Pare e me mostre.

**Leia:** `ARQUITETO 4` D8 (8.1 a 8.7); `ARQUITETO 3` §4.2 (E6, E7), §5.5 (I4, I8), §14; `programa-novo/03` (imagens e pivô, o PSD pela guia, trocar a pasta) e `05` (G3); `DEGRAU 4b` suposição 12 (pivô e atlas do corpo do instante: é sua); `COMO SE FAZ EFEITO 2026-09-16.md` #1 (pasta numerada); memória: *padrão sem recorte para pivô*.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 8.1 | A **grade do botão direito lista entidades** (E6); trocar imagem por entidade herda osso, **pivô** (a raiz do filho cai no pivô: `x, y` do anexo), ordem e chaves (E7). O arrasto que sai do painel Entidades (D5) tem o tipo `text/x-recorte-entidade` | `image-picker.ts`, `image-grid-model.ts`, `pivot-model.ts` |
| 8.2 | **Copiar a ordem chave a chave** (G3): grava em cada chave `drawOrder` que existe, não só em 0 | `draw-order-model.ts:802-819` |
| 8.3 | **Trocar pasta de origem…** (I4): um desfazer; nome repetido avisa e não troca em silêncio | `project-folder.ts sameFolderImages`, `palette.ts` |
| 8.4 | **Alinhar a imagem** (I8): PSD pela guia; sem guia, pela tela; tamanho diferente avisa | `ferramentas/src/importar/psd.ts:712` |
| 8.5 | Painel **Pivôs** (C4): a pasta inteira em grade, cruz em cada miniatura, sem janela que tranca. **Linha em `layout-model.ts`** | `pivot-dialog.ts`, `palette.ts` |
| 8.6 | **Pasta numerada vira sequência** (D4 gesto): `olho_01…olho_08` soltas juntas viram um anexo com `sequence` | `drop-plan.ts` (passagem: só acrescentando; o dono é o D10) |
| 8.7 | Pivô e atlas do **corpo do instante** (4b, sup. 12): carimbar o pivô no atlas do corpo certo num projeto de vários corpos | `pivot-model.ts`, `project-folder.ts` |
| 8.8 | Testes em `grade-de-imagens`, `pasta-do-projeto`, `pivo`, `ordem` | `editor/testes/` |

**Pronto quando:** o botão direito num desenho lista imagens **e** entidades, e trocar por entidade deixa a raiz do filho no pivô da imagem; Copiar a ordem escreve em toda chave; Trocar pasta desfaz num passo e avisa nome repetido; o PSD com guia alinha pela guia; o painel Pivôs aparece na coluna e é medido (25 painéis); oito imagens numeradas viram uma sequência; testes da parte sem queda; `tsc` limpo; roteiro 14/14 (com o "pode"). Versão, mensagem, e para.

---

## Chat D9 — Peles (degrau 9)

**A ordem, na voz do Humberto:**

> Execute o degrau nove, só ele. Peles: Feitas e Ativas no lugar do olho, arrastar liga, tira e reordena, a de cima vence, a default pode sair da pilha; a pilha e a pele em edição separadas no estado do editor; um lápis só, osso e regra nascem na pele do lápis, com sinal na Árvore e na cena; ligar o lápis liga a pele, desligar some com o que só existia nela; editar a pele na mesma janela; fazer a pele como o Spriter, uma imagem ou a pasta inteira, grupo do PSD é pasta; Exportar pele e Importar pele, a pele de fora com osso entra na pilha; Promover pele a base; a opção da pilha passar na virada, na ficha da chave body; e os três defeitos: regra Comando vazia avisa, Inércia meio, Escala cem. Reescreva os testes, a contagem não cai. Não toque no runtime. Pare e me mostre.

**Leia:** `ARQUITETO 4` D9 (9.1 a 9.11); `ARQUITETO 3` §5 inteiro; `programa-novo/04` (peles); `PLANO peles em bloco` e `PROJETO DAS PELES 2026-09-16.md` (lotes B e C, a pilha Feitas/Ativas); spec §4.4 (a pilha), §2.8 (pele de fora com osso), §9.13 (`keepSkins`); o runtime já tem `setSkinStack` (a pilha pura) e `setSkin` (a `default` por baixo, **compatibilidade até este degrau**: agora o editor passa para `setSkinStack`).

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 9.1 | **Feitas / Ativas** no lugar do olho (I7); arrastar liga, tira, reordena; **a de cima vence**; a `default` pode sair da pilha (I10). O editor passa a chamar `setSkinStack` com a pilha inteira, e o `combinedSkins` da cena, da prévia e da exportação segue a pilha | `skins.ts`, `skins-model.ts`, `onion.ts skinChoices`, `preview.ts`, `export-image.ts` (passagem) |
| 9.2 | `pilha[]` e `emEdicao` separados em `RECORTE_editor_state` (E10); `visibleSkins[0]` deixa de ser o lápis | `contract.ts visibleSkins` (passagem) |
| 9.3 | **Um lápis só** (I5): osso e regra novos nascem `skinRequired` na pele do lápis; **sinal** na Árvore (`tree-rows.ts`, passagem) e na cena (`viewport-draw.ts`, passagem), ícone com nome | `skins-model.ts skinForRequired` |
| 9.4 | **Aplicar e modificar** (I6): ligar o lápis liga a pele na pilha; desligar some com tudo que só existia nela | `skins-model.ts` |
| 9.5 | Editar a pele **na mesma janela**; editar = apertar o lápis (I7b, I7d) | `skins.ts` |
| 9.6 | **Fazer a pele como o Spriter** (I9): uma imagem por vez **ou** a pasta inteira; grupo do PSD = pasta | `image-picker.ts` (passagem: é do D8), `psd.ts` (passagem) |
| 9.7 | **Exportar pele… / Importar pele…** (I12): `.bone` só de `skins` com `rig`; a pele de fora **com osso** entra na pilha como as outras (F23; o runtime já monta) | `io/export-skin.ts`, `open-save.ts` (passagem: o dono é o D10) |
| 9.8 | **Promover pele → base** (I13, F25): corpo novo com a pilha escolhida assada na `default`; entra em Corpos | `skins-actions.ts` |
| 9.9 | A opção **a pilha passa na virada** (`keepSkins`) na ficha da chave `body` | `properties-model.ts` |
| 9.10 | Defeitos **A4** (regra Comando vazia avisa), **A5** (Inércia `0,5`), **A6** (Escala `100`) | `rules-model.ts:321`, `properties-model.ts:1007, 1052` |
| 9.11 | Testes em `peles`, `regras`, `paineis`, `arvore`, `cena` (as asserções de árvore e cena que forem suas: só elas) | `editor/testes/` |

**Pronto quando:** o painel Peles tem Feitas e Ativas; arrastar reordena e a de cima vence na cena; a `default` sai da pilha e a arte dela some; osso novo com o lápis numa pele nasce `skinRequired` e a Árvore mostra o sinal; desligar a pele some com ele; Exportar pele grava um `.bone` só de `skins` com `rig` e Importar pele traz `lobisomem-rabo.bone` com o rabo na pilha; Promover pele cria o corpo; a ficha da chave `body` tem a opção; os três defeitos fechados; testes da parte sem queda; `tsc` limpo; roteiro 14/14 (com o "pode"). Versão, mensagem, e para.

---

## Chat D10 — Arquivo, exportar, importar (degrau 10)

**A ordem, na voz do Humberto:**

> Execute o degrau dez, só ele. Arquivo: Novo, Abrir e Salvar falam de projeto e corpo; Salvar grava a pasta inteira; Salvar como pacote zipa o bonez; Entregar um corpo grava um bone com atlas fatiado; abrir outro bone como corpo ou como entidade; salvar entidade editada pergunta Novo ou Por cima, dizendo quantos projetos usam; exportar imagem com as duas opções de recorte, borda automática ou a área da animação, com o retângulo magenta na cena; o importador do Spriter faz projeto, cada entity um corpo, e o pai do sprite por chave vira slot barra bone; o glTF recebe um corpo e a virada vira aviso. Reescreva os testes, a contagem não cai. Não toque no runtime. Pare e me mostre.

**Leia:** `ARQUITETO 4` D10 (10.1 a 10.7); `ARQUITETO 3` §1.3 (saída **a**: a pasta é o `.bonez` aberto), §1.4 (E17, E4), §8 (`crop`); `DEGRAU 4b` suposições 1, 2 e 3 (o uri da chave `body` por `skeletonsBase`, os corpos em subpasta, o manifesto só com o segundo arquivo: **são suas**); spec §2.9 (o projeto é um `.bonez`; `manifest.extras.RECORTE_projeto`), §4.6 (`crop`), §13.3 (Spriter: `entity` → corpo, `object_ref.parent` → `slot/bone` com `transform`); o validador da linha de comando já abre `.bonez` (`ferramentas/validador/validar.mjs`), leia como ele resolve a base dentro do ZIP.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 10.1 | **Novo, Abrir, Salvar falam de projeto e corpo** (P3); **Salvar** grava a pasta inteira (um `.bone` por corpo e por entidade, `manifest.json`, um atlas); **Salvar como pacote…** zipa o `.bonez`; **Entregar um corpo…** (P2) grava um `.bone` + atlas fatiado | `shell-file.ts`, `open-save.ts`, `folder-save.ts` |
| 10.2 | **Abrir outro `.bone`** como corpo ou como entidade (E17): copia (ou referencia) para a pasta do projeto, lista, abre a base (corpo) ou fica fechado (entidade) | `open-save.ts`, `drop-plan.ts` |
| 10.3 | Salvar entidade editada: **Novo / Por cima**, dizendo quantos projetos usam o original, se souber (E4) | `open-save.ts` |
| 10.4 | **Exportar imagem** com as duas opções (F16, Q21): borda automática (padrão) ou `animation.crop`; o retângulo **magenta** na cena quando existe (`viewport-draw.ts`, passagem) | `export-image.ts:67, 900` |
| 10.5 | **Importador do Spriter**: SCML → projeto (cada `entity` um corpo); `object_ref.parent` que muda entre chaves → chave `slot/bone` com `transform`; `--assar` continua | `ferramentas/src/importar/spriter.ts` |
| 10.6 | **glTF**: o exportador recebe um corpo; a virada vira aviso | `export-gltf.ts` |
| 10.7 | As suposições do 4b: o uri da chave `body` resolvido por `skeletonsBase`; corpos em subpasta no Abrir e no Salvar | `project-open.ts`, `folder-save.ts` |
| 10.8 | Testes em `arquivo`, `documento`, `exportar-e-importar`, `exportar-por-pele`, `ferramentas/testes` (importador) | `editor/testes/`, `ferramentas/testes/` |

**Pronto quando:** um projeto de dois corpos salva a pasta com `manifest.json` e reabre igual; Salvar como pacote gera um `.bonez` que `npm run validar` abre com três vereditos; Entregar um corpo grava um `.bone` só com o atlas fatiado; Abrir outro `.bone` entra como corpo ou como entidade; a exportação de imagem oferece as duas opções e a cena mostra o magenta; o SCML de teste vira um projeto com um corpo por `entity` e a troca de pai do sprite vira `slot/bone`; testes da parte sem queda; `tsc` limpo; roteiro 14/14 (com o "pode", e o passo 13/14 do roteiro, salvar e reabrir a pasta, continua igual para o projeto de um corpo). Versão, mensagem, e para.

---

## Desvios e suposições (cada chat escreve na sua)

### Chat D8

Escrito pelo Chat D8 (`EXECUTANDO · imagens, ordem e entidades`), 18/09/2026.
Versões: **v15.0** (lote 1: 8.1, 8.2, 8.6) e **v15.3** (lote 2: 8.3, 8.4, 8.5,
8.7). O 15.1 e o 15.2 foram tomados pelo D9 e pelo D10 enquanto eu rodava a
suíte: peguei o próximo livre, como manda o `versao.py`.

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | **Trocar por entidade vai para a BASE do corpo do instante, e não vira chave.** Com uma animação aberta, trocar uma imagem por outra grava chave (Q9); trocar por ENTIDADE não | Herdar as chaves (E7) exige guardar o **nome** do anexo, e uma chave nova apontaria para um nome novo — as duas coisas se excluem. Trocar o TIPO do anexo (`region` → `skeleton`) é mexida estrutural, como criar osso ou malha, e o rodapé diz *"foi para a base"* pelo `wentToBase` de sempre |
| 2 | **A grade abre também no desenho que já é entidade, e o clique numa imagem desfaz a troca.** Não estava pedido | Sem isso, trocar por entidade fechava a porta por onde ela entrou: o `swapPickFor` das peles só conhece imagem e devolvia `null`, e a grade não abria mais naquele desenho. Porta de mão única é o defeito da regra 21. Por isso nasceu o `gridNow`/`gridTarget` em `image-picker-model.ts`, ao lado do `swapPickFor` (que é do D9 e não foi tocado) |
| 3 | **`pivotInBone` e `placeAtPivot` são conta nova em `pivot-model.ts`** | A §10.3 tinha a ida (onde o osso cai dentro da imagem) e a volta (o `x/y` que põe o pivô no osso); faltava **o ponto**, no espaço do osso, onde a imagem está encaixada — que é onde a raiz do filho cai (E7). Uma desfaz a outra, e o teste cobra isso com giro e escala |
| 4 | **Sem pivô carimbado, a raiz do filho cai no `x, y` do anexo** | É a letra da §7.11 (*"o mesmo par que a imagem do placeholder tinha"*), e cai sozinho da conta: região sem pivô é o centro, e `pivotInBone` devolve o `x, y` |
| 5 | **A miniatura da entidade mudou de casa para `panels/entity-thumb.ts`** | `palette-entities.ts` **registra um painel** ao carregar; importá-lo só para desenhar um quadradinho registraria a aba Entidades em todo lugar que abre a grade, inclusive num teste que não pediu painel nenhum. O painel continua exportando as duas coisas, e o veto E16 (miniatura parada) passou a ser cobrado **nos dois arquivos** |
| 6 | **Copiar a ordem escreve em cada chave `drawOrder` que existe, mais a de 0 — e não apaga mais a linha** | 8.2 pede chave a chave. O que o código velho fazia era apagar a linha inteira e gravar uma chave em 0: na tela dava no mesmo, e por isso o defeito passava despercebido — os TEMPOS das chaves, que são trabalho de alguém, iam para o lixo sem volta |
| 7 | **A cópia da ordem passou a ler o corpo do instante** (`baseOrder(corpoDe(doc).file, …)`, chaves de `doc.file`) | Era `doc.file` nos dois, de antes do degrau 4b; o `runOrderChange` ao lado já fazia certo. Num projeto de dois corpos a base é do corpo do instante e as chaves são da animação aberta |
| 8 | **Pasta numerada: o gesto é o BOTÃO DIREITO no cabeçalho da subpasta**, não o soltar na janela | A palavra dele é *"pasta numerada vira sequência"*, e a regra do lote 59 — também dele — é que **nada entra na cena sozinho** ao soltar na janela. Quem solta oito quadros de fogo continua vendo-os entrarem na aba Imagens; o que mudou é que o rodapé **diz onde está o gesto** em vez de deixar a pessoa achando que virou bagunça. O modelo é o Spine 4.2, onde um grupo numerado vira UM attachment de sequência |
| 9 | **A sequência exige números seguidos e do mesmo tamanho de algarismos** (`fogo_01, fogo_02, fogo_09` não vale) | Um buraco no meio quase sempre é um arquivo que ficou para trás. Virar sequência ali esconderia o erro em vez de mostrá-lo (regra 21) |
| 10 | **A sequência nasce na origem da raiz**, e não onde o ponteiro estava | Ela vem de um menu, e menu não tem ponto de soltura. O rodapé diz o que nasceu e onde |
| 11 | **Trocar pasta de origem casa pelo NOME DO ARQUIVO** (`mao_aberta`), não pelo caminho inteiro | É o character map por nome de arquivo (I4): a pasta nova tem os mesmos nomes em outro lugar. O Recarregar compara caminhos inteiros e por isso não servia |
| 12 | **Nome repetido na pasta nova: aquela imagem não troca, e a barra diz as candidatas** | Palavra dele: *"avisa, não escolhe"*. Escolher uma das duas seria pôr a arte errada no personagem em silêncio |
| 13 | **A sequência fica de fora da troca de pasta** | O `path` dela é um **prefixo**, não um nome de imagem; trocá-lo por nome de arquivo estragaria os quadros |
| 14 | **A pasta nova vira a pasta do documento antes da troca** | As imagens dela precisam existir para ganhar região provisória e pivô. Sem troca nenhuma, a pasta **não** é trocada: um plano vazio não mexe em nada |
| 15 | **O PSD lê o bloco de recursos de imagem (1032) que antes era pulado inteiro** | É onde moram as guias. Bloco estragado não derruba a importação: as guias voltam vazias, o arquivo entra pela tela, e uma linha de aviso diz isso |
| 16 | **Meia guia alinha meio, e DIZ qual metade** | Só uma guia: aquele eixo vem dela, o outro do meio da tela. Meio alinhado sem aviso é o pior dos dois mundos |
| 17 | **`PsdDocument.guides` é campo obrigatório** | Todo PSD lido tem guias, ainda que a lista esteja vazia. Um literal de teste em `editor/testes/varios.test.ts` ganhou o campo — foi a única linha que precisou mudar |
| 18 | **"Tamanho diferente avisa" (I8) virou `folderSizeWarning`, à vista no painel Pivôs** | O padrão da arte é **sem recorte**: a mesma tela, o encaixe no mesmo pixel. Com telas de tamanhos diferentes esse alinhamento não existe, e o pivô passa a viajar por proporção — um palpite razoável, e não a verdade. Então se diz |
| 19 | **O painel Pivôs não tranca, e não tem botão de gravar: o clique JÁ é o passo de desfazer** | É o "sem janela que tranca" do C4. A janela **Definir pivô…** do lote 58 continua de pé para quem chega pelo botão direito numa imagem: ela não foi arrancada |
| 20 | **A cruz de cada miniatura é desenhada pelo painel, e não pela miniatura do atlas** | A miniatura do atlas sabe desenhar a cruz, mas a imagem que **ainda só está na pasta** não tem região — e é ela que mais precisa deste painel. Uma grade com cruz em metade das peças seria pior que uma sem nenhuma |
| 21 | **Carimbar pivôs passou a ler o corpo do instante** (8.7, fecha a suposição 12 do 4b) | Com o lobisomem na tela, carimbar o arquivo em foco gravaria os números do homem no atlas do lobisomem. Os pivôs de imagem só da pasta (`folderPivots`) continuam no `RECORTE_editor_state` do **foco**, como a suposição 12 dizia: eles são do projeto, não de um corpo |
| 22 | **Toquei em arquivos fora da minha parte, só acrescentando:** `io/drop-plan.ts` (a conta pura da sequência), `ui/shell-drop.ts` (a frase de quem solta imagens numeradas), `ui/icons.ts` (o ícone `swap-folder`), `ui/menus.ts` e `ui/layout-model.ts` (o painel Pivôs), `main.ts` e `panels/index.ts` (a folha e o registro do painel) | Todos relidos do disco antes de gravar. O `drop-plan.ts` é do D10 e só ganhou funções novas; nenhuma linha existente mudou de comportamento |
| 23 | **Reescrevi asserções de outros arquivos de teste, e só as que provam a MINHA mudança:** a lista de painéis em `colunas-e-barra`, `ordem`, `tema-e-ficha` e `exportar-e-importar` (entrou `pivos`), a contagem em `acoes` (186 → 187, pelo painel novo), e o literal do PSD em `varios` | A regra da rodada: asserção que prova comportamento de outro chat é do outro chat. A do rótulo `Abrir pasta…` era do D10 e **não** foi tocada; a do `exportar-pele` em dois menus é do D9 e **não** foi tocada |

## O que ficou de fora — Chat D8

| O quê | Por quê |
|:---|:---|
| **Soltar oito imagens numeradas na janela criar o anexo sozinho** | Bate de frente com a regra do lote 59, palavra dele: *"nada entra na cena sozinho"*. O que entra é o aviso com o gesto — desvio 8 |
| **Grade de entidades por pasta, ou busca nela** | A grade da cena tem seis células por linha e é um gesto de um clique. Uma lista de entidades longa pede o painel Entidades, que já existe ao lado |
| **Arrastar a subpasta numerada para a cena** | O arrasto novo precisaria do lado de quem RECEBE, que é a Cena (parte do D7) e o `drop-plan.ts` (parte do D10). O menu do cabeçalho faz o gesto inteiro hoje, dentro da minha parte |
| **Trocar a pasta de origem de um projeto de vários corpos de uma vez** | O comando troca o acervo do **corpo do instante**. Trocar todos os corpos num passo é um comando de projeto, e o dono do projeto é o D10 |
| **Ler o pivô que o plugin do Spine grava no PSD** | A guia dá a origem do documento, que é o que o 8.4 pede. Pivô por CAMADA é outro dado, e não está na tabela |

| 24 | **`baseOrder` punha a `default` por fora da pilha** (v15.7, achado pelo D9). Com o degrau 9 a `default` é uma pele como as outras e pode sair; a conta velha continuava aplicando o `drawOrder` dela, e a aba Ordem mostrava uma ordem que a cena não desenhava. Agora a Ordem lê a **pilha** (`orderSkins`), de baixo para cima, e não o `visibleSkins` — que é o lápis primeiro e daria a ordem ao contrário | Linha da minha parte, consertada depois do fecho do degrau 8, sem roteiro nem medição (ordem do PLANEJADOR: o D10 estava em `export-image.ts` ao mesmo tempo) |

## Duas coisas aprendidas no caminho — Chat D8

| O quê | A regra que fica |
|:---|:---|
| **O painel Pivôs nasceu ROLANDO por inteiro**, e a medição o pegou: `sobram 283 px` a 1280×720. A régua do Humberto é clara — rolar só em painel com palco ou lista que cresce, **nunca em texto fixo** —, e a parte fixa dele (prévia, nove pontos, Repetir, aviso) era o que estava rolando | Painel novo com uma parte fixa e uma lista: a lista leva `flex: 1 1 auto; min-height: 0; overflow-y: auto` **e** a parte fixa leva `flex: 0 1 auto; min-height: 0`. Sem o segundo, é o corpo do painel que estica e rola, e a marca `data-rolagem="lista"` não salva ninguém. Encolhi a prévia de 200 para 110 px e apertei os nove pontos: o Pivôs passou a **caber nas duas telas**, e a medição de altura subiu de 17 para **19 de 26** |
| **O roteiro ficou vermelho três vezes seguidas no passo 14** (reabrir a pasta dava documento vazio; uma das vezes quebrou com `ReferenceError: __r is not defined`), e depois passou 14/14 duas vezes sem eu mexer em nada. No meio disso, o `find -newermt` mostrou outro chat gravando em `editor/src` (`skins*.ts`, `menus.ts`, `actions-table.ts`) | **A regra das portas não basta: o roteiro monta o código do disco na hora.** Um chat gravando em `editor/src` enquanto outro roda o roteiro dá vermelho falso do mesmo jeito que duas janelas na mesma porta. Antes de caçar um defeito no passo 14, rode de novo e confira se a casa estava vazia — `find editor/src -newermt "-5 minutes"` responde em um segundo |

### Chat D9

Escrito pelo Chat D9 (`EXECUTANDO · peles`) em 18/09/2026. Três lotes:
**v14.9** (9.1, 9.2, 9.4, 9.5, 9.10) · **v15.1** (9.3, 9.9) · **v15.4** (9.6,
9.7, 9.8). Nada do runtime foi tocado.

#### As decisões que tomei sem perguntar

| # | A escolha | Por quê |
|:---:|:---|:---|
| 1 | **`visibleSkins` não morreu: virou vista.** O estado de verdade é `pilha` (a pilha inteira, de baixo para cima, com a `default` dentro) e `emEdicao` (o lápis); `visibleSkins` continua existindo, calculada dos dois — o lápis primeiro, depois as ativas, sem a `default` | Uma dúzia de módulos ainda lê `doc.visibleSkins[0]` como "onde o desenho novo nasce": Árvore, paleta, tomadas, malha ligada, importador de PSD, ferramentas de Ponto e Caixa. Trocar os doze no mesmo lote, com D8 e D10 gravando ao lado, era pedir conflito. A vista os atende sem mentir, e quem for mexer neles pede `skinStackOf(doc)` e `editingSkinOf(doc)` |
| 2 | **O `skins` velho continua sendo GRAVADO** no `RECORTE_editor_state`, junto com `pilha` e `emEdicao`; na leitura, `pilha` manda quando existe | Um arquivo salvo hoje abre num editor de ontem com as mesmas peles ligadas. E ler `skins` por cima de uma `pilha` escrita apagaria uma `default` que saiu **de propósito** (I10). Os três caminhos têm teste |
| 3 | **`doc/document.ts` foi tocado**, e ele não está na tabela das cercas de ninguém | A 9.2 pede `pilha` e `emEdicao` no `RECORTE_editor_state`, que é escrito e lido lá, e a pilha vai de lá para o `actor.setSkinStack`. Tratei como arquivo de passagem: reli do disco antes de gravar, e mexi só no que é de pele. Avisado ao Planejador |
| 4 | **`panels/view-panel.ts` (Exibição) foi acertado**, também fora das cercas | Ele repetia a lista de peles com a frase *"a `default` fica sempre embaixo"* e o quadradinho dela apagado. No dia em que a `default` passou a poder sair da pilha, aquilo virou mentira na tela (regra 21). Agora ele dirige a mesma pilha, e a frase diz o que é verdade. **O grupo continua sendo um segundo lugar de ligar pele** — se o Humberto quiser um dono só (regra 5), o corte é de uma linha e é dele |
| 5 | **A ordem da coluna Ativas é a da pilha de cabeça para baixo**: a de cima da lista é a última do array, que é a que vence (§4.4) | "A de cima vence" só se lê se quem vence estiver em cima. Confundir a posição da tela com a do array foi o erro que os testes `stackDrop` prendem |
| 6 | **O `×` de Ativas ficou**, ao lado do arrastar | Arrastar para fora desliga, como ele pediu; mas um arrasto de 200 px para tirar uma pele, repetido vinte vezes, cansa. O `×` é o mesmo gesto num clique, e chama a MESMA função |
| 7 | **Uma faixa "embaixo de todas"** no fim da coluna Ativas | Sem ela não havia onde soltar uma pele para o **fundo** da pilha — e é assim que a `default` volta a ser o corpo por baixo depois de ter saído |
| 8 | **A pele de fora (F23) aparece em Feitas com uma marca**, e não se renomeia nem se apaga por aqui | Quem manda nela é o arquivo dela. Renomear aqui mudaria o nome só na tela, e no dia seguinte a pilha citaria um nome que o arquivo não tem |
| 9 | **Importar pele põe o uri em `assets.skins` (2.8); não copia a pele para dentro do corpo** | É o modelo do Dota 2, é o que o runtime já monta, e é o que deixa trocar a roupa sem reabrir o personagem. A conformidade mede esse caminho (C-294) |
| 10 | **`exportar-pele` continuou sendo o fatiar**; o do degrau 9 virou **`exportar-pele-arquivo`** | O D8 achou a colisão: dois menus pediam o mesmo id, e nove asserções caíram. São duas coisas de fato diferentes — *Por pele…* corta o corpo inteiro, *Exportar pele…* grava só a roupa —, então são dois ids (regra 17). As contagens de `acoes.test.ts` (tabela 190, arranque 25) são minhas |
| 11 | **`importar-pele` mora no PAINEL**, e não no arranque, como as outras duas | Ela precisa do seletor de arquivo do painel. As outras duas valem com a aba fechada, porque a conta delas é do documento |
| 12 | **A ficha da chave `body` (9.9) só aparece com o cursor EM CIMA da virada** | Fora dela não há chave para editar, e uma caixa apagada o ano inteiro é uma caixa que se aprende a ignorar. Ela entrou em `panels/properties.ts`, que também não é de ninguém nesta rodada: ~20 linhas, acrescentando |
| 13 | **O sinal do osso "só com a pele" é um anel tracejado na cena e uma marca na Árvore**, em cor diferente da marca de regra | São duas perguntas diferentes ("este osso se mexe sozinho?" e "este osso é da roupa?"), e duas marcas laranjas iguais seriam uma só, borrada |
| 14 | **`skinRequired` sem pele nenhuma** é dito como o que é: *"ele nunca aparece"* | É um arquivo torto, e calar sobre ele é a regra 21 quebrada. Quem o recusa de verdade é o validador |
| 15 | **A 9.6 não tocou `image-picker.ts` nem `psd.ts`** (os dois são do D8, que estava gravando neles) | A conta da pele por pasta é pura, sobre **nomes de imagem**, e o grupo do PSD já chega como `pasta/nome`. Trocar uma imagem por vez continua sendo o botão direito do D8 |

#### O que ficou de fora, e de quem é

| O quê | Por quê, e o degrau que fecha |
|:---|:---|
| **`draw-order-model.baseOrder` ainda põe a `default` por baixo por fora** | O arquivo é do D8, e a mudança não é de uma linha. **Consequência real, medida:** com a `default` FORA da pilha, a aba Ordem ainda aplica o `drawOrder` dela. A cena, a prévia e a exportação estão certas (elas seguem o esqueleto, que recebe a pilha pura). É uma linha para o D8 ou para o D11 |
| **`export-image.ts` continua chamando `setSkin(doc.visibleSkins)`** | O arquivo é do D10, que gravava nele. Pela vista velha ele acerta **enquanto a `default` estiver na pilha**; com ela fora, a imagem exportada leva a arte que a cena já não mostra. É uma linha, no degrau que puder tocá-lo. **A `preview.ts` eu consertei** (ela não é de ninguém nesta rodada): a Prévia passou a receber a pilha pura, porque uma prévia que mostra o que a cena não mostra é a pior coisa que ela pode fazer |
| **`Skeleton.setSkin` (o de compatibilidade) continua no runtime** | O comentário dele diz *"remove this when the editor moves to the stack"*, e o editor mudou — mas o runtime não é meu neste degrau. Fica para quem abrir `runtime/` |
| **Editar a pele "na mesma janela" (I7b)** está entendido como *não abrir janela nenhuma*: o lápis e as duas colunas vivem no painel | Se o que ele quer é uma tela de edição da pele (a janela que o Spriter abre, mas embutida), isso é um pedido a mais, e é dele |
| **A prova `npm run medir` não mede as duas colunas** | Elas nascem dentro do painel Peles, que já é medido; o painel não mudou de lugar nem de id |

#### O recado do roteiro, de volta ao Planejador

O passo 13 caiu na volta do D10 porque `pilha` e `emEdicao` não estavam no
`ESTADO_PERMITIDO` de `ferramentas/provas/roteiro-30.mjs`. Consertado por mim,
só aquela linha, relida do disco antes: os dois campos são estado do editor e
moram onde `skins` morava (E10). O `skins` antigo não foi tirado de lugar
nenhum — ver a decisão 2 acima.

### Chat D10

**Versões: v14.8** (lote 1: 10.1, 10.2, 10.3, 10.7) e **v15.2** (lote 2: 10.4,
10.5, 10.6). O número do segundo lote **não** é o 14.9: ele foi tomado pelo D9
enquanto eu rodava a suíte. Peguei o próximo livre e pus a seção do `CHANGELOG`
acima do mais novo que havia na hora (a v15.1). É a armadilha que o D5 escreveu
no fecho da rodada passada, vista de outro ângulo: com três chats fechando no
mesmo dia, o número livre muda **entre a decisão e a gravação**.

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | **A uri de um corpo e o caminho dele na pasta são duas coisas** (fecha a suposição 1 do 4b). As chaves de `projeto.corpos` continuam sendo a **uri crua** — é por ela que o `Actor` casa o corpo (9.13), e o runtime não é meu. O **caminho** (`skeletonsBase` + uri) é o que o `manifest.json` lista e o que o Salvar grava. A tradução mora em `io/project-open.ts` (`skeletonsBaseOf`, `joinBase`, `uriOfPath`), nas duas pontas do disco | Resolver o uri dentro do `Actor` seria mexer no `runtime/`, que a ordem proíbe. Num projeto que o editor mesmo criou a base é vazia e os dois são a mesma string: nada muda para o herói |
| 2 | **Corpo em subpasta abre e salva** (fecha a suposição 2 do 4b): `boneInFolder` desce as subpastas, e o atlas da **raiz** vai junto com o corpo de lá | Um corpo em `corpos/lobo.bone` resolve o atlas contra a pasta dele (2.8), mas o projeto tem **um** atlas, e ele mora na raiz. Sem essa junção o corpo da subpasta abriria sem imagem nenhuma e ninguém saberia por quê (regra 21) |
| 3 | **A suposição 3 do 4b continua de pé, e de propósito**: um projeto de um corpo só **não** ganha `manifest.json`. O manifesto nasce com o segundo arquivo | O passo 13 do roteiro compara a pasta salva com a reaberta; o encargo pede que ele continue igual para o projeto de um corpo |
| 4 | **A entidade que o projeto abriu fica guardada inteira** em `projeto.guardados`, como o corpo rebaixado do degrau 5 — e é isso que o Salvar grava e o Promover acha sem ler o disco. Entidade só **listada** (veio de um manifesto e ninguém a leu) não tem texto: fica na lista, e o arquivo dela continua onde estava | Sem documento não há o que gravar, e inventar um `.bone` vazio no lugar dela apagaria o arquivo de verdade |
| 5 | **"Quantos projetos usam o original" (E4) é respondido pela metade, e a janela diz que é pela metade**: o editor conta os corpos **deste** projeto que citam a uri (chave `body` ou anexo `skeleton`) e escreve, na linha seguinte, que de outros projetos ele não sabe | O "se souber" do E4. Um número inventado faria alguém gravar por cima achando que ninguém mais usa — regra 21, na forma mais cara dela |
| 6 | **O que veio de fora é lembrado na sessão** (`rememberOutside` em `io/open-save.ts`), e não no arquivo | É estado de sessão: qual `.bone` do disco deu origem a qual uri do projeto. No `.bone` seria estado de editor viajando para dentro do formato (R8), e o passo 13 do roteiro pega isso |
| 7 | **`Salvar a entidade editada…` é um item de menu, e não um desvio do `Ctrl+S`** | O `Ctrl+S` grava o projeto; a pergunta Novo/Por cima só faz sentido para um arquivo com origem fora da pasta, e pô-la no caminho de todo Salvar seria uma janela a mais no gesto mais repetido do dia |
| 8 | **O `crop` é só lido: o degrau 10 não dá porta para desenhá-lo.** A exportação oferece as duas opções e a cena mostra o magenta; quem grava o retângulo ainda não existe | A tabela 10.4 pede as duas opções e o retângulo, não a ferramenta. Uma animação sem `crop` cai na borda automática **com aviso**, e é assim que se descobre que a porta falta |
| 9 | **Com o retângulo da animação escolhido, a borda NÃO é cortada** | O retângulo é o enquadramento pedido; comê-lo pela borda o desmentiria, e o quadro sairia de outro tamanho |
| 10 | **O pai do sprite vira `slot`/`bone` no SLOT, e o osso auxiliar fica como estava** (10.5): nas chaves em que o pai é outro, a chave `slot/bone` manda, com o local daquela chave no `transform`; quando volta ao pai do arquivo, a chave é `null` e o osso auxiliar volta a mandar, com as timelines `bone/*` que ele já tinha | É o que a spec 9.5 e a 13.3 descrevem, e o que faz a espada não saltar. Tirar as timelines do osso auxiliar quebraria as chaves em que nada mudou de pai |
| 11 | **`importSpriter` continua entregando UM corpo**; quem quer o projeto inteiro chama `importSpriterProject`, e a linha de comando o faz sozinha quando há mais de uma `entity` e não veio `--parte` | Não quebra quem já chamava o importador de antes — inclusive o editor, que importa para dentro do documento aberto |
| 12 | **O nome do arquivo de um corpo vindo do Spriter é limpo na mão** (`Um Dragão!` → `um-dragao.bone`): sem acento, minúsculo, e só `a-z0-9._-` | O `sanitizePath` do `comum.ts` serve para caminho de imagem e deixa passar `!` e maiúscula; nome de arquivo tem regra mais dura, e duas entities com nomes parecidos não podem cair no mesmo `.bone` |
| 13 | **`Key.transform` entrou no `comum.ts`** (campo opcional), que é compartilhado com o Spine e o DragonBones | Só acrescenta; nenhum dos outros dois grava o campo. Sem ele o importador do Spriter não tem onde pôr o local da chave `slot/bone` |
| 14 | **Toquei em `io/project-open.ts`, `io/save-binary.ts`, `ui/shell.ts` e `ui/shell-actions.ts`** — os dois primeiros são da parte Arquivo (`io/*` no `PARTES.md`) e estão citados na tabela 10.1/10.7; os dois últimos, só acrescentando, como passagem. **Não editei `doc/projeto.ts`**: as listas `entidades` e `guardados` são públicas e foram usadas de fora | Confirmado pelo PLANEJADOR antes do lote 2 |
| 15 | **Reescrevi duas asserções de outros arquivos de teste, e só elas**, porque provam a MINHA mudança de rótulo: `editor/testes/pasta-do-projeto.test.ts` ("Abrir pasta do projeto…", pedido pelo Planejador) e `ferramentas/testes/ligacao-fase4.test.ts` ("Novo projeto", "Abrir projeto…") | A regra da rodada: asserção que prova comportamento de outro chat é do outro chat — e esta provava o meu |

## Números do fecho — Chat D10

| Prova | Resultado |
|:---|:---|
| `npx vitest run` (suíte inteira) | **3.264** (3.234 verdes, 29 pulados, **1 vermelho**: o do manual, de 15/09, o único aceitável). Eram 3.119 na linha de base |
| Testes novos meus | **23**: 9 em `arquivo` (lote 1), 10 em `exportar-e-importar` + 1 do pacote no validador (lote 2), 3 em `ferramentas/testes/importar` |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo nos meus arquivos |
| `npm run roteiro` | **14 de 14**, console limpo. O passo 13 (salvar a pasta) e o 14 (fechar e reabrir) passam para o projeto de um corpo, como o encargo pede |
| `npm run medir` | 26 de 26 de lado, 17 de 26 de altura |
| Pacote do projeto no validador | `npm run validar projeto.bonez` abre com **três vereditos** (manifesto + dois corpos), sem erro e sem `BODY_MISSING` — está no teste, não só na mão |
| `python ferramentas/montar-programa.py` | montado |

## O que ficou de fora — Chat D10

| O quê | Por quê |
|:---|:---|
| **Desenhar e editar o `crop` na cena** | Não está na tabela 10.4: ela pede as duas opções na exportação e o retângulo na tela. A porta de gravar o retângulo é de outro degrau |
| **O `drop-plan.ts` não ganhou caminho novo** | 10.2 o cita, mas soltar um `.bone` na janela já cai em `abrir`/`escolher`, que continuam trocando o documento. Trazer o arquivo solto **para dentro** do projeto (como corpo ou como entidade) exigiria um plano novo de arrasto, com a pergunta no meio; as duas portas do menu fazem o gesto inteiro hoje |
| **Copiar o arquivo de fora para a pasta do projeto** ao abrir como corpo/entidade | `ARQUITETO 3` §1.4 diz "copia (ou referencia)". Hoje ele é **referenciado**: entra no projeto pela uri e é gravado na pasta no Salvar seguinte. Copiar na hora precisaria de permissão de escrita antes de a pessoa ter salvo qualquer coisa |

---

## Fecho da rodada — 18/09/2026, manhã, pelo PLANEJADOR

| Chat | Versões | Números do fecho dele |
|:---|:---:|:---|
| D10, arquivo | v14.8, v15.2, v15.6 | roteiro 14/14 (na primeira volta 13/14: o passo 13 caiu pela 9.2 do D9, consertado); medição 26/26 e 17/26; 27 testes novos |
| D8, imagens, ordem e entidades | v15.0, v15.3, v15.7 | roteiro 14/14; medição 26/26 e **19/26** (o Pivôs cabe nas duas telas); 153 testes novos |
| D9, peles | v14.9, v15.1, v15.4, v15.5 | roteiro 14/14; medição 26/26 e 19/26 (a aba Peles cabe); a parte foi de 51 para 120 testes |
| Planejador | v15.8 | com os três parados: suíte 3.278 (1 vermelho, o do manual), `tsc` limpo, 71/71 nos dois runtimes, roteiro e medição no `CHANGELOG` |

**Regras novas para as próximas rodadas:**

| # | Regra | De onde veio |
|:---:|:---|:---|
| 1 | **Ninguém grava em `editor/src` enquanto alguém prova.** O roteiro monta o código do disco na hora; gravar durante a prova de outro dá vermelho falso. Antes de rodar: `find editor/src -newermt "-5 minutes"`. O "PODE" do Planejador passa a querer dizer também "os outros pararam de gravar" | D8, que viu o passo 14 cair três vezes e passar duas sem mexer em nada |
| 2 | **Campo novo no `RECORTE_editor_state` precisa de uma linha no `ESTADO_PERMITIDO` do `roteiro-30.mjs`** (e da declaração no `contract.ts`), senão o passo 13 acusa "arranjo de tela dentro do arquivo" | D9 e D10, pelo passo 13 |
| 3 | **Ação de menu é UM id** (regra 17): duas portas para coisas diferentes são dois ids, mesmo com rótulos parecidos | D8 e D9, pelo `exportar-pele` em dois menus |
| 4 | **Depois de um reinício do aplicativo o endereço é o título da janela.** Quem espera resposta e não recebe roda `ListAgents` antes de mandar de novo | o reinício das 07:55 |
| 5 | Sobra achada em arquivo de chat já parado volta **ao dono**, com o teste que teria pego, sem roteiro; as provas ficam para o fecho, com todos parados | as duas sobras da `default` |

**Próximo:** D11 (casca), com o Humberto vendo. Só com a palavra dele.
