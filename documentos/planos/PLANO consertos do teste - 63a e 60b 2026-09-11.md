# PLANO consertos do teste do Humberto — 63a e 60b · 11/09/2026

Planejador → executor. Dois lotes que nasceram do Humberto testando o programa em 10 e 11/09. Até agora só existiam em mensagens; aqui viram plano, com teste e Desvios. **Entram antes de tudo:** 63a, depois 60b, depois 65 → 64 → 66 → roteiro dos 30 minutos.

## Lote 63a — cinco consertos, um lote

| # | O que ele viu | Causa provável | O que fica |
|:---:|:---|:---|:---|
| 1 | Janela **"Virar filho de qual osso?"** ao apertar P. *"Isso não tem no Spriter."* | `startReparent` + `askPick` (`viewport.ts` 681–704) e o `parentMode` do `select.ts` (592–596): P com desenho ou vários escolhidos entrava no modo "clique no pai" | **Um gesto só.** Exatamente um osso escolhido + P segurado + clique em osso ou desenho = vira filho, sem mover (`ChildGrab`). Sem um osso escolhido, P só avisa: *Escolha um osso. Depois segure P e clique em quem vira filho dele*. Sai o `parentMode`; sai a janela; o item de menu **Esqueleto → Virar filho de…** sai (ou vira a mesma frase) |
| 2 | *"Associei um objeto ao osso, ele arrastou o objeto."* | algum dos quatro caminhos não recalcula o anexo (x, y, rotation, scale) do mundo para o osso novo, ou recalcula só na pele em edição | Trocar de pai **nunca move**: P, arrastar na Árvore, campo Osso, Criar osso pega. Todas as peles. Montagem e Animando (no Animando a conta usa a pose animada do osso antigo e do novo) |
| 3 | *"A Árvore está bugada, não dá para mudar o parentesco por lá."* | provável efeito do 60a (raiz invisível) sobre o `drop` da Árvore, ou as linhas dos desenhos soltos sem alvo | Arrastar linha sobre osso troca o pai: osso sobre osso, desenho sobre osso, desenho solto sobre osso |
| 4 | `root` na lista da janela | listas de ossos montadas de `file.bones` sem filtrar | `root` fora de **toda** lista para o usuário: campo Osso, pai do Criar osso, qualquer outra. A raiz é invisível (60a) |
| 5 | *"Mandei gerar malha, o negócio saiu correndo."* Foto em Animando, t 0,40 s, peça vinda da pasta | `regionToMesh` (`mesh-edit.ts` 112–152) lendo `width/height` ausentes (o lote 56 apaga os dois) como 0 ou como o recorte, e/ou usando a pose animada | Virar malha e Gerar a forma **não movem um pixel**. Se os botões da aba Malha e pesos não valem em Animando, ficam cinza com a dica, em vez de gerar errado |

**Testes, com valor esperado**

| Teste | Esperado |
|:---|:---|
| `parentGesture(selection)` | só dois resultados: `'pegar-filhos'` (um osso) e `'nada'` (o resto). Os testes do lote 31 do modo "clique no pai" viram testes do aviso |
| `auditMenus` sem Virar filho de… | vazio; `lote-menus` ajusta a conta do menu Esqueleto |
| Desenho solto na raiz em (120, −40), osso girado 45° com escala 1,5. Prender por P, Árvore, campo Osso, Criar osso pega | os 4 cantos do desenho em **mundo** iguais antes e depois, em 1e-6, nos quatro caminhos; em todas as peles onde o slot tem anexo; um passo de desfazer devolve por texto |
| O mesmo em Animando, `walk`, t 0,4, osso animado | mundo igual em t 0,4 |
| Arrastar na Árvore: `hand` sobre `torso`; desenho `cape` sobre `hips`; desenho solto sobre `arm` | `parent`/`bone` novos, mundo igual, um passo de desfazer cada |
| Toda lista de ossos da interface (`boneChoices` ou equivalente) | não contém `root` |
| `regionToMesh` em anexo **sem** `width/height`, região do atlas e região provisória da pasta; com e sem giro; solto e preso | 4 cantos de mundo iguais antes e depois, em 1e-6 |
| Botões da aba Malha e pesos em Animando | cinza, com a dica *Volte à Montagem (Ctrl+Tab)*, ou funcionam com a pose de setup: um dos dois, testado |

**Pronto quando:** o Humberto escolhe o osso, segura P, clica nas peças, e nada se move nem abre janela; a Árvore arrasta; virar malha não foge.

## Lote 60b — a troca de imagem exatamente como o Spriter

Foto do Spriter, 11/09: com a mão escolhida aparece **na própria cena**, embaixo do desenho, uma faixa de miniaturas, uma por imagem da mesma pasta, a atual destacada; embaixo, um seletor **"fonte: pasta | objeto"**. Clicar troca. Do nosso, ele disse: *"o seu é um menu dos satanás"*. E: *"a nossa pode ser em grade, para não ser uma fileira enorme"*.

| O que | Como |
|:---|:---|
| Onde | **na cena**: camada HTML por cima do canvas, ancorada ao contorno de mundo do desenho escolhido, acompanha zoom e pan. Logo embaixo do contorno, centrada; se não couber embaixo, em cima |
| Forma | **grade** de miniaturas iguais (~40 px), **até 6 por linha**, quebrando em linhas. Sem rolagem de lado. Fundo claro translúcido. A atual com contorno laranja. Nome na dica |
| Quando aparece | ao escolher um desenho com um clique (Selecionar ou Transformar). Fica enquanto ele estiver escolhido. Some ao começar um arrasto, volta ao soltar. `Esc` e clique no vazio somem com ela. Opção em Exibição desliga |
| Fonte | seletor pequeno embaixo da grade: **pasta** = todas as imagens da subpasta da imagem atual; **objeto** = só as que este slot já usou (peles e chaves de Desenho). A escolha fica no navegador |
| Clique | `SwapSlotImage` (recoloca pelo pivô, lote 56). Em Animando com Gravar ligado = chave de Desenho no tempo atual. `Shift` = todas as peles. Setas andam, Enter troca, com o foco na grade |
| O que sai | a lista com busca do `image-picker.ts` como gesto principal. O campo Imagem das Propriedades pode ficar, secundário |

**Funções puras, com teste**

| Função | Esperado |
|:---|:---|
| `gridEntries(file, folderImages, slot, source)` | `source 'pasta'`, `maos/` com 6 imagens → 6 entradas, a atual marcada, ordem natural; `source 'objeto'`, slot que já usou 2 → 2; imagem sem pasta → as do mesmo prefixo até a última `/` |
| `gridLayout(count, perRow = 6)` | 14 → 3 linhas `[6, 6, 2]`; 5 → `[5]` |
| `gridAnchor(worldBox, camera, rows)` | contorno no meio da tela → embaixo, centrado; contorno colado no rodapé → em cima; nunca fora da cena |
| clique na 3ª miniatura | anexo aponta para ela; `x/y` pelo pivô; `width/height` ausentes; um passo de desfazer |

**Pronto quando:** clicar na mão mostra a grade embaixo dela; clicar noutra mão troca e ela cai no pulso.

## Ordem de trabalho

Backup antes; INDICE; contagem não cai; ícone com nome na dica; tecla tratada uma vez; `tsc`; `conformidade.mjs`; CHANGELOG; `versao.py`; **remontar o programa/ e avisar** (o Humberto testa pelo `Abrir o editor.bat`, F5). Manual pausado. Três linhas ao Humberto por lote. Depois de cada lote, o **ROTEIRO dos 30 minutos**.

## Desvios

### Lote 63a — v9.6

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| "Entra antes de tudo" (e, na mensagem, "antes do 63") | O 63 já tinha saído (v9.5) quando o 63a chegou | Feito depois, como v9.6 |
| 1. Sai o `parentMode` e a janela; o item de menu sai, ou vira a frase | O item Esqueleto → Virar filho de… e o botão direito da Árvore abriam a janela | O item do menu **ficou** e só diz a frase, com a tecla P. Por isso o `lote-menus` não mudou. O item do botão direito da Árvore saiu, e a linha dele em `CONTEXT_ACTIONS`. `auditMenus` segue vazio |
| Os testes do lote 31 do modo "clique no pai" viram testes do aviso | Também quatro no lote 0, um no lote 29, e a frase do P no lote 31 | Reescritos para provar o contrário; nenhum apagado. Os originais estão em `backup/lote63a_2026-09-11_antes/editor-testes/` |
| PENDENCIAS item 8 ("a lista com busca resolveu") | A lista saiu | O item perde a razão. O contorno laranja segue fora: com um gesto só, o osso escolhido já é o pai |
| 2. Algum caminho não recalcula o anexo, ou só na pele em edição | Em Montagem, a conta (`L' = P'⁻¹ · W`, em todas as peles) já guardava o mundo em P, campo Osso e Criar osso. O que movia era **Animando**: `runReparent` voltava para a Montagem, e a cena inteira pulava para a pose de repouso. Não reproduzi no programa (o painel do navegador está escondido neste chat): é a leitura do código, e o teste prova o conserto | Só desenhos, em Animando: fica em Animando e mede o mundo na pose da tela (`liveWorldMatrices`, guardada no comando para refazer igual). Com osso junto, continua voltando à Montagem, porque a pose local do osso é a de repouso. Consequência: na pose de repouso, o desenho preso em Animando fica onde o quadro pedia |
| Teste: desenho em (120, −40); Animando, `walk`, t 0,4 | Um documento pequeno prova o mesmo sem depender do herói | Imagem em (30, 40), girada 10°, nas duas peles, mais uma caixa e um osso; o osso novo a 45° e com escala 1,5. Animando com uma animação que gira o osso a 80°; o teste confere que a pose da tela é diferente da de repouso |
| 3. "Provável efeito do 60a" | Não era o 60a. Só osso sobre osso trocava o pai: slot sobre osso era recusado (`source.kind !== target.kind`), e a linha do desenho nem arrastava | `treeDropAction` puro: slot ou desenho sobre osso vira filho, sem mover; slot sobre slot muda a ordem, como antes |
| Teste da Árvore com `hand`, `cape` e `arm` do herói | O mesmo documento pequeno | Slot sobre osso, linha de desenho (a caixa) sobre osso, e osso sobre osso: pai novo, mundo igual, um passo de desfazer cada |
| 4. `root` fora de toda lista | As listas das regras (cadeia, Alvo, osso da física) mostravam a raiz. O Criar osso não tem lista de pai: o pai é o osso escolhido | Saiu das listas das regras, a não ser quando já é o valor (senão a lista mostraria um valor que não existe). No campo Osso do desenho continua, com o nome *nenhum (livre)*: é o jeito de soltar um desenho |
| 5. Virar malha foge | Três caminhos, na leitura do código: o tamanho vinha dos pixels da página (em px da página, sem a escala do atlas; e 0 quando a página ainda não tinha chegado, e a malha encolhia num ponto); com atlas cortado, a malha pegava a imagem inteira, e os UV saíam do recorte; e, em Animando, o painel mede com os ossos da pose animada | `regionToMesh` recebe a região do atlas e faz a conta do runtime (`computeRegionFrame`): os mesmos cantos e os mesmos UV, em 12 casos (atlas cortado; com escala e deitado na página; imagem da pasta; com e sem giro; solto e preso). Em Animando, os sete botões que gravam a forma ou os pesos ficam cinza, com *Volte à Montagem (Ctrl+Tab)*, e as ações se recusam também |
| Roteiro dos 30 minutos depois do lote | Não há script para ele, e o painel do navegador está escondido neste chat | Não rodado neste lote |
| Conferência na cena | Painel do navegador escondido | Provado pelos testes, não na tela |

### Lote 60b — v9.7

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| A grade na cena, camada HTML ancorada ao contorno do desenho | A cena não pode importar a lista: é o círculo de módulos do lote 60 | A grade mora em `image-picker.ts`, junto da troca do lote 60 (`chooseImage`), e a cena a chama pela porta `ui/picker-hook.ts` (`syncImageGrid`), a cada quadro desenhado |
| `gridEntries(file, folderImages, slot, source)` | Precisa saber qual é a imagem de agora, e se há pasta aberta | Recebe `{ current, folderOpen }` a mais. As contas moram num módulo novo, `panels/image-grid-model.ts` |
| `gridAnchor(worldBox, camera, rows)` | — | Devolve também a largura, a altura e o lado (`baixo` ou `cima`). O tamanho vem de `gridSize`, com os mesmos números do CSS, e o teste confere os dois |
| Fonte objeto: "as que este slot já usou (peles e chaves de Desenho)" | — | `slotImages`: todo desenho com imagem do slot, em toda pele, e o que as chaves `attachment` de toda animação mostram |
| Some ao começar um arrasto, volta ao soltar | A cena só redesenha quando algo muda | Ao soltar o ponteiro, a cena pede um quadro. Durante o arrasto a grade fica escondida |
| `Esc` some com a grade | O `Esc` na cena já limpa a escolha, e a grade some junto | Com o foco na grade, o `Esc` é dela: esconde a grade até a escolha mudar. Tecla tratada uma vez |
| "O que sai: a lista com busca como gesto principal" | O clique parado no desenho já escolhido abria a lista (lote 60) | O clique parado não abre mais nada. A lista fica secundária: campo Imagem das Propriedades, Ficha rápida e botão direito do desenho (Trocar por…). `opensPicker` fica no modelo: os testes do lote 60 o usam |
| Opção em Exibição desliga | O tipo do estado do menu é usado por um ajudante de teste que não conhece a opção | `imageGrid` entrou como opcional no estado do menu, como as guias; ligada por padrão |
| "Selecionar ou Transformar" | — | As mesmas seis ferramentas do lote 60: Selecionar, Transformar, Mover, Girar, Escalar e Inclinar |
| Seletor "fonte: pasta \| objeto" | Regra da casa: botão novo nasce em ícone | Ficou em palavra, como o plano desenha: são duas palavras curtas que são o próprio valor; a dica diz o que cada uma mostra |
| Conferência na cena | O painel do navegador está escondido neste chat, e não há ferramenta aqui que o mostre | Não conferido na tela; provado pelos testes. A foto não saiu |

### Lote 60c — pedido direto do Humberto — v10.0

Dois recados, com fotos, na conversa com o executor, 11/09. Não passaram pelo planejador: o executor avisou depois.

| O pedido dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| "Joga isso [a grade] pro outro botão, o de opções, é o botão direito" | O 60b abria a grade sozinha ao escolher. A pesquisa (manual do Spriter, fluxo 7) diz: segurar o botão direito mostra a fileira de miniaturas | Clique esquerdo só escolhe. O botão direito escolhe o desenho e abre a grade ali. Exibição → Grade de imagens saiu, sem função |
| "Era para ser trocar imagens e algumas opções como no Spriter" | O Spriter só mostra as miniaturas; as opções são nossas | Embaixo da grade: Em todas as peles (vale como o Shift), Trazer para a frente, Mandar para trás, Duplicar, Apagar. Todas são ações que já existiam |
| — (risco achado) | Clicar num desenho preso a um osso escolhe o osso junto: "Apagar" e "Duplicar" levariam o osso inteiro | Cada opção escolhe só o desenho antes de rodar |
| "Não sei por que tem trocar pivô no botão direito" | O pivô estava lá desde o lote 60 | Saiu. Fica na aba Imagens, como o duplo clique na imagem do Spriter. Trocar por… e Trocar em todas as peles… também saíram: a grade é a troca |
| "Se eu clicar em uma parte sem imagem, o clique passa direto" | O clique era pelo retângulo da imagem, e a conta do clique é pura, sem pixel | A cena instala um leitor de pixel (`setAlphaSampler`), que lê cada página do atlas uma vez. Abaixo de 16 de 255 de opacidade, o clique passa. Imagem que ainda não chegou: pega, como antes. O retângulo de seleção continua pelo contorno |
| — | Com a peça escolhida, o miolo da caixa do Transformar movia | Com só desenhos escolhidos, o miolo só pega onde há pixel de um deles; no transparente vale como fora da caixa. Com osso escolhido, como antes |
| — (achado nos testes) | Um teste do 60a arrastava o grupo pelo vão vazio entre duas peças; um do 60 e dois do 60b provavam o menu e a opção antigos | Reescritos; nenhum apagado. Os originais estão em `backup/lote60c_2026-09-11_antes/editor-testes/` |
| Roteiro | O passo 8 abria a grade pelo clique esquerdo | Passa a abrir pelo botão direito. Rodada: 13 de 14, só o 7 (lote 64) |
