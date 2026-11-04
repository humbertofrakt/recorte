# Plano da rodada 2 — o que falta para ser funcional, mais as possibilidades escolhidas

Escrito em 08/09/2026 pelo planejador. Para o executor.
Vem **depois** da rodada 1 (`PLANO rodada 1`, cinco lotes, v1.6 a v2.0).
O Humberto delegou a escolha (08/09/2026): "vou confiar nas suas capacidades".

## O que eu escolhi, e por quê

Das 65 possibilidades (`POSSIBILIDADES NOVAS`), entram **28** nesta rodada. Critério, nesta ordem:

1. Vários manuais fazem igual: é padrão, o usuário espera.
2. Cabe no formato de hoje. Nada que mude o `.bone`.
3. Custo P, ou M quando destrava o caminho mínimo.
4. Já tem metade pronta no código.

Três da lista **já existem** e saem: 70 (Shift trava 15°: `rotate.ts` já faz), 80 (Auto, Suavizar, Podar: `weights.ts` já tem), 92 (arrastar sem encaixe: Alt já faz na linha do tempo).

As outras 34 ficam para a rodada 3, listadas no fim.

## Resumo em uma tabela

| Versão | Lote | Itens | O que o Humberto vai ver |
|:---:|:---:|:---:|:---|
| v2.1 | 4 | 15, 17 | **cena maior**: uma linha de ícones em cima, uma linha na linha do tempo, botão ⋯ Mais |
| v2.2 | 5 | 12, 13 | ferramentas **Ponto** e **Caixa**: o pivô da arma, a caixa do soco |
| v2.3 | 6 | 47, 48, 2 | **Máscara**, silhueta vira máscara, mover a imagem sem mover o osso |
| v2.4 | 7 | 57, 58, 61, 59 | ver e travar um a um: esconder o escolhido, só este, só o resultado, nome sob o cursor |
| v2.5 | 8 | 66, 67, 72, 73, 75, 53, 56 | montar mais rápido: osso já preso, redesenhar, pose de repouso, substituir nomes, miniaturas, setas, inverter |
| v2.6 | 9 | 81, 82, 100, 93, 95 | laço e marcas: trecho de laço, marcadores, modos de fim, pular 10, só do escolhido |
| v2.7 | 10 | 85, 86, 87, 88, 89, 90, 91, 84 | chaves em bloco: copiar pose, colar em todos, apagar de todos, limpar, ripple, cortar, chavear tudo × escolhido |
| v2.8 | 11 | 103, 105, 106, 110, 114, 102, 62 | arquivo e ajuda: repetir exportação, reabrir, configurações, paleta de comandos, barra por modo, prévia tela cheia, imagem de referência |
| v2.9 | 12 | 19, 20, 28, 30 | abas na direita, Tab esconde, Exibição em 3 colunas, cebola na régua, Prévia perto |
| v3.0 | 13 | 11, 25, 26, 27, 31, 33, 21 | duração, chave do osso, interpolação, borda, colar em todas, âncora, Inclinar |

Lotes 4, 5, 6, 12 e 13 são da lista do pesquisador. A especificação de cada item está no `documentos/pesquisa/menu/08`. **Ela manda.** Aqui só o que o executor precisa saber do código.
Lotes 7 a 11 são as possibilidades novas. A especificação está aqui.

As regras da rodada 1 (backup, módulo puro, `Command`, `animationOnly`, tecla uma vez, dica, `CHANGELOG`, manual nas duas línguas, versão numerada) **valem todas**. A conferência que fecha cada lote é a mesma.

---

## Lote 4 → v2.1 · Itens 15 e 17 · Cena maior

Spec: `08`, itens 15 e 17. Decisão do Humberto: **só o símbolo no botão**, nome e tecla na dica.

| Peça | Como |
|:---|:---|
| Ícones | SVG inline, 20 px, em `ui/icons.ts` como texto. Conjunto **Lucide** (MIT), citado no `NOTICE`. Nunca fonte externa: o editor roda sem internet |
| Barra de cima | `viewport.ts` `buildToolbar`: ferramentas como ícone + `title`/`aria-label`. **Eixos** vira um `<select>` com três palavras. **Compensar** sai da barra e vai para o painel Propriedades, visível só com Mover, Girar ou Escalar ativa. As três caixas continuam ligadas a `setCompensation` |
| Travar | o grupo Travar fica na mesma linha, como dois ícones de cadeado com `aria-pressed` |
| Linha do tempo | `dopesheet.ts`: `buildTimeGroup` (Fator, Esticar seleção, Espelhar no tempo, Fechar ciclo, Pares de nome, Espelhar esquerda e direita) some da tela e vira o menu do botão **⋯ Mais**, escrito. As mesmas ações já estão no menu Animação desde o lote menus |
| Nome das ferramentas | Editar → Preferências → "Mostrar nome das ferramentas": `localStorage`, chave `RECORTE_prefs.toolNames`. Liga o texto ao lado do ícone |
| Medida | `conferir-editor.mjs` passa a imprimir a altura da cena em % da janela. Pronto quando: **60 % ou mais** em 1440×900 |

Teste sem DOM: `toolbarItems()` devolve a lista de botões com `icon`, `label`, `key`; nenhum sem `label`. `moreMenuItems()` tem as 6 ações do bloco. Teste varre `getTools()` e confere que cada uma tem ícone em `icons.ts`.

## Lote 5 → v2.2 · Itens 12 e 13 · Ponto e Caixa

Spec: `08`, itens 12 e 13.

| Peça | Como |
|:---|:---|
| Ferramenta Ponto (O) | `viewport/tools/point-tool.ts`, no molde de `create-bone.ts`: `onDown` guarda a posição, `onMove` mede o ângulo, `onUp` roda o comando. Alt + arrastar cria. Sem Alt, arrastar um ponto existente move; arrastar a seta gira |
| Comando | `AddPointAttachment(osso, x, y, rotation)` em `panels/tree-model.ts`: cria slot `nome_ponto` no osso e o anexo `point` na pele editável (`editableSkin`). `kind: 'structure'`. `revert` tira slot e anexo |
| Mover e girar | `SetProperty` nos campos do anexo, com `mergeWith`. Em Animando: **não cria chave** (ponto não tem linha do tempo de posição). Barra: "Posição do ponto é da montagem" |
| Ferramenta Caixa (X) | `viewport/tools/box-tool.ts`. Alt + arrastar desenha o retângulo. `AddBoundingBox(osso, vértices)`: 4 vértices em torno do osso. Editar depois com a ferramenta Malha, que já move vértices |
| Árvore | Novo → Ponto e Novo → Caixa (as entradas cinza do lote menus ficam vivas) |
| Propriedades | ponto: nome, x, y, rotação. Caixa: nome, vértices (só leitura), cor |
| Cena | `drawPoints` e `drawBoundingBoxes` já desenham |

Teste: criar o ponto `cano` no osso `braco` do esqueleto do lote 0, exportar pelo `pose-dump`, e o canal `points` traz `x`, `y`, `rotation` no mundo iguais aos da conta feita à mão. Caixa: canal `boundingBoxes` com 4 vértices no mundo. `revert` devolve o JSON igual.

## Lote 6 → v2.3 · Itens 47, 48 e 2 · Máscara, silhueta, mover a imagem

Spec: `08`, itens 47, 48 e 2.

| Peça | Como |
|:---|:---|
| Máscara | Novo → Máscara: `AddClipping(osso)` cria slot e anexo `clipping` com 4 vértices, `end` = último slot. Propriedades: **Recorta até** (lista de slots), **Só estes** (caixas), **Inverter**. Cena: polígono tracejado, cor própria. O runtime já recorta |
| Silhueta vira máscara | botão "Usar a silhueta de…" nas propriedades da máscara: chama o traçado que já existe em `mesh/mesh-edit.ts` e copia para `clipping.vertices`. Um comando |
| Exibição | caixa **Máscaras** em `ViewSettings` (`clippings: boolean`), tecla nenhuma |
| Mover a imagem (2) | com um **desenho** escolhido e nenhum osso, Mover/Girar/Escalar mexem em `x`, `y`, `rotation`, `scaleX`, `scaleY` do anexo, no espaço do osso. Uma cruz na raiz do osso mostra a âncora. Em Animando não cria chave; barra avisa. `mergeWith` como o `SetProperty` de `select.ts` |

Teste: máscara no `braco` com `end` = slot `desenho`: `render-png` do esqueleto do lote 0 tem menos pixels desenhados que sem máscara. Mover o desenho 40 px muda `attachment.x` em 40 e o osso não muda; `Ctrl+Z` devolve.

---

## Lote 7 → v2.4 · Itens 57, 58, 61, 59 · Ver e travar um a um

### O que muda

| # | O que | Tecla | Onde |
|:---:|:---|:---:|:---|
| 57 | **Esconder o escolhido** | H | menu Exibir, Árvore (bolinha de ver por linha) |
| 57 | **Só este**: esconde todo o resto | Shift+H | menu Exibir |
| 57 | **Mostrar tudo** | Ctrl+Alt+3 | menu Exibir |
| 58 | **Travar o escolhido** | Ctrl+2 | menu Esqueleto. Já existe o cadeado na Árvore: é a mesma ação |
| 58 | **Travar o resto** | Ctrl+Shift+2 | menu Esqueleto |
| 58 | **Destravar tudo** | Ctrl+Alt+2 | menu Esqueleto |
| 61 | **Ver só o resultado** | Ctrl+Shift+H | menu Exibir. Um liga-desliga: guarda o `view` atual, desliga ossos, nomes, pontos, caixas, máscaras, malhas, arestas, pesos, grade, eixos e cebola; desligar devolve o `view` guardado |
| 59 | **Nome sob o cursor** | — | caixa em Exibir: "Nome ao passar o mouse". Etiqueta pequena na cena, só quando parado 300 ms |

### Como construir

| Peça | Como |
|:---|:---|
| `viewport/onion.ts` | `ViewSettings` ganha `hiddenBones: string[]`, `hiddenSlots: string[]`, `cleanView: ViewSettings \| null` (o guardado do 61), `hoverNames: boolean`. `parseViewSettings` aceita faltar (arquivo velho). Funções puras: `hideSelected(view, selection)`, `soloSelected(view, file, selection)`, `showAll(view)`, `lockSelected`, `lockOthers(view, file, selection)`, `unlockAll`, `toggleCleanView(view)` |
| Cena | osso ou slot escondido **não desenha e não pega**. `picking.ts` já filtra travados; passa a filtrar escondidos também. Escondido é diferente de travado: travado aparece |
| Árvore | linha ganha uma bolinha de ver ao lado do cadeado. Mesmo molde do cadeado do lote 0 |
| Gravação | tudo em `RECORTE_editor_state.view`, como o cadeado. Nunca no runtime |
| Menu | as entradas cinza do lote menus ficam vivas. Marcadas quando ligadas |
| Nome sob o cursor | `viewport.ts`: no `pointermove`, guarda o último pick; um `setTimeout` de 300 ms desenha a etiqueta no `drawOverlay`. Sem DOM novo: é canvas |

### Testes — `editor/testes/lote7-ver-e-travar.test.ts`

| Caso | Espera |
|:---|:---|
| `hideSelected` com `hips` escolhido | `hiddenBones` = `['hips']` |
| `soloSelected` com `braco` | `hiddenBones` = todos menos `braco` e seus ancestrais; `hiddenSlots` = todos menos os do `braco` |
| `showAll` | listas vazias |
| `lockOthers` com `braco` | `lockedBones` = todos menos `braco` |
| `toggleCleanView` duas vezes | `view` igual ao de antes, campo a campo |
| `pickAll` com `hips` escondido | `hips` não aparece; o retângulo do lote 0 pega 16 ossos, não 17 |
| `parseViewSettings` de um `view` da v1.5 | não quebra; listas novas vazias |

### Manual

Capítulo 2, "Escolher: clique, retângulo e trava": esconder e só este. Inglês igual.

---

## Lote 8 → v2.5 · Itens 66, 67, 72, 73, 75, 53, 56 · Montar mais rápido

### O que muda

| # | O que | Gesto ou tecla | Onde |
|:---:|:---|:---|:---|
| 66 | **Criar osso já preso à imagem** | ferramenta Criar osso com um desenho escolhido: **Ctrl** + arrastar. O osso nasce onde arrastou e o slot do desenho passa a ser dele | cena |
| 67 | **Redesenhar o osso** | ferramenta Criar osso com um osso escolhido: **Alt** + arrastar refaz posição, ângulo e comprimento. Os filhos ficam no lugar (compensar filhos ligado por dentro) | cena |
| 72 | **Voltar à pose de repouso** | Ctrl+1 osso escolhido. Ctrl+Shift+1 todos | menu Esqueleto. Em Animando grava chave com o valor da montagem; em Montagem não faz nada e avisa |
| 73 | **Buscar e substituir nomes** | Ctrl+F abre a busca da Árvore (item 34) com um segundo campo "Trocar por". Botão "Trocar em todos" | Árvore |
| 75 | **Miniaturas na lista de desenhos** | a lista do item 9 mostra a imagem do atlas, 24 px, ao lado do nome | Propriedades e Árvore |
| 53 | **Setas movem 1 px** | ← → ↑ ↓ com osso ou desenho escolhido. Shift = 10 px. Só quando a **cena** tem o foco: na linha do tempo as setas já andam no tempo | cena |
| 56 | **Inverter a seleção** | Ctrl+Shift+I | menu Editar |

### Como construir

| Peça | Como |
|:---|:---|
| 66, 67 | `create-bone.ts`: `onUp` olha `e.ctrl` e `e.alt`. Ctrl: `AddBone` + `SetProperty` de `slot.bone` num `EditKeys`-like de estrutura, **um passo de desfazer**. Alt: `RedrawBone(nome, x, y, rotation, length)` com a mesma conta de `compensate.ts` para segurar os filhos. Puro: `boneFromDrag(parentFrame, start, end)` já existe; reaproveitar |
| 72 | `anim/pose-mode.ts`: `resetToSetup(doc, ossos)`: para cada osso, `keyTargetsNow` com o valor de `setupValueFor`. Um `EditKeys` |
| 73 | `panels/tree-model.ts`: `renameMany(file, de, para) → {renomeados, pulados}` usa `renameBoneEverywhere`, `renameSlotEverywhere` e os outros. Nome que já existe: pula e diz. Um comando `RenameMany` |
| 75 | `panels/properties.ts`: a opção do `choice` ganha `image?: string` (URL do recorte do atlas). `imageFor(page)` já dá a página; recortar com um canvas pequeno e cachear por nome |
| 53 | `viewport.ts` `onKeyDown`: setas quando há seleção e nenhuma ferramenta tratou. `nudgeSelection(doc, dx, dy)` em `tools/select.ts` usa `writeBoneValues`, que já decide Montagem × chave |
| 56 | `viewport/picking.ts`: `invertSelection(file, selection) → Selection` sobre ossos e slots visíveis e não travados |

### Testes — `editor/testes/lote8-montar.test.ts`

| Caso | Espera |
|:---|:---|
| Ctrl + arrastar com o slot `desenho` escolhido | um osso novo; `slot.bone` = osso novo; **um** `Ctrl+Z` devolve os dois |
| Alt + arrastar com `hips` escolhido | `hips.length` e `rotation` novos; `torso` no mesmo lugar do mundo (tolerância 1e-6) |
| `resetToSetup` em Animando no `walk`, tempo 0,5 | chave em 0,5 com o valor da montagem; JSON volta com `revert` |
| `resetToSetup` em Montagem | nada muda, retorna 0 |
| `renameMany('_esq', '_e')` no herói | todos os `_esq` trocados em ossos, slots, chaves, regras; nome que colidiria fica na lista `pulados` |
| `nudgeSelection` 1 px em Montagem | `bone.x` sobe 1 no espaço do pai |
| `invertSelection` com `hips` escolhido | todos menos `hips`; travados e escondidos fora |

### Manual

Capítulo 1, passos 4 a 6: o caminho curto com Ctrl. Capítulo 2: redesenhar, substituir nomes. Capítulo 3: voltar à pose de repouso. Inglês igual.

---

## Lote 9 → v2.6 · Itens 81, 82, 100, 93, 95 · Laço e marcas

### O que muda

| # | O que | Gesto ou tecla | Onde |
|:---:|:---|:---|:---|
| 81 | **Trecho de laço** | Alt + clique esquerdo na régua = início. Alt + clique direito = fim. Faixa sombreada. Tocar repete só o trecho. Botão "Tirar trecho" no ⋯ Mais | régua da linha do tempo |
| 82 | **Marcadores** | M com a linha do tempo em foco cria uma marca no tempo atual; duplo clique dá nome. Ctrl+↑ Ctrl+↓ pulam de marca em marca | régua |
| 100 | **Modos de fim** | lista ao lado de Repetir: Parar · Repetir · Vai-e-volta · Voltar ao início | tocador |
| 93 | **Pular 10 quadros** | Shift+← Shift+→ | linha do tempo |
| 95 | **Só do escolhido** | caixa no ⋯ Mais: "Mostrar só os escolhidos" | linha do tempo |

### Como construir

| Peça | Como |
|:---|:---|
| Onde mora | trecho de laço e marcadores são **de sessão do editor**, não do jogo: `RECORTE_editor_state.timeline = { loop?: {from, to}, markers?: [{time, name}] }`, por animação (`Record<nome, …>`). Nunca no núcleo. Modo de fim: só sessão, não grava |
| `anim/transport.ts` | `tick` respeita `range` (`from`, `to`) e `endMode`: `'parar' \| 'repetir' \| 'vai-e-volta' \| 'voltar'`. Vai-e-volta troca o sinal da velocidade nas pontas |
| `anim/markers.ts` **novo** | `addMarker`, `removeMarker`, `renameMarker`, `nextMarker(times, t)`, `previousMarker`. Puro |
| Régua | `dopesheet.ts` `renderRuler`: faixa do trecho e triângulos das marcas. Alt + clique nos dois botões, com `preventDefault` no `contextmenu` |
| Filtro | `dopesheetGroups` recebe `onlySelected: Selection \| null` e devolve só os grupos dos escolhidos. A linha Resumo continua com todas |

### Testes — `editor/testes/lote9-laco-e-marcas.test.ts`

| Caso | Espera |
|:---|:---|
| transport com `range` 0,2 a 0,6 e `repetir`, tick passa de 0,6 | volta para 0,2 |
| `vai-e-volta`, tick passa do fim | velocidade negativa; tempo volta |
| `voltar`, tick passa do fim | tempo = início, parado |
| `addMarker` em 0,5, `nextMarker` de 0,3 | 0,5 |
| `renameMarker` e `revert` | JSON do `RECORTE_editor_state` igual ao de antes |
| `dopesheetGroups` com `onlySelected` = `hips` | um grupo |

### Manual

Capítulo 3, "Laço": o trecho. "A linha do tempo": marcas. Capítulo 3, tocador: modos de fim. Inglês igual.

---

## Lote 10 → v2.7 · Itens 85, 86, 87, 88, 89, 90, 91, 84 · Chaves em bloco

### O que muda

| # | O que | Tecla | Onde |
|:---:|:---|:---:|:---|
| 85 | **Copiar a pose inteira** | Ctrl+Shift+C copia o valor de **todos** os alvos no tempo atual, mesmo entre chaves (interpolado). Ctrl+V cola como chaves no tempo atual, em qualquer animação | linha do tempo, menu Animação |
| 86 | **Colar em todas as chaves** | Ctrl+Shift+V: o valor copiado vai para toda chave da linha (item 31, junto) | linha do tempo |
| 87 | **Apagar de todos os quadros** | Shift+Delete: tira as linhas do tempo do escolhido inteiras | linha do tempo |
| 88 | **Limpar a animação** | menu Animação → "Limpar as chaves do escolhido" · "Limpar a animação inteira" (pergunta) | menu |
| 89 | **Mover com as seguintes** | Ctrl + arrastar uma chave empurra as que vêm depois, em todas as linhas escolhidas | linha do tempo |
| 90 | **Duplo clique apaga** | duplo clique no losango | linha do tempo |
| 91 | **Cortar** | Ctrl+X = copiar + apagar | linha do tempo |
| 84 | **Chavear tudo × escolhido** | K = escolhido (como hoje). Ctrl+K = todos os ossos e slots, com o valor atual | tocador, menu |

Alt já é "sem encaixe" no arrasto de chave. Por isso o ripple é **Ctrl**, não Alt como no Spine.

### Como construir

| Peça | Como |
|:---|:---|
| `anim/keying.ts` | `poseAt(file, animação, tempo) → KeyClipboard` com o `valueAt` de todo alvo animado (um item por linha do tempo). `pasteKeys` já cola no tempo. `rippleMove(file, animação, refs, delta)`: junta às `refs` toda chave das mesmas linhas com `time > min(refs)` e chama `moveKeys`. `removeTimelines(file, animação, alvos)` |
| `pasteToAllKeys(file, animação, clipboard)` | para cada item do clipboard, escreve o valor em **toda** chave da linha. Item 31 fecha junto |
| `keyAllNow(doc)` | `keyTargetsNow` com `allTargetsOf` (já existe em `timeline-tools.ts`) |
| Dopesheet | duplo clique no losango → `RemoveKey`. Ctrl no `onKeyDown` do arrasto liga o ripple. Ctrl+X, Ctrl+Shift+C, Shift+Delete no `onKeyDown` |
| Tudo é `EditKeys` | um passo de desfazer por gesto |

### Testes — `editor/testes/lote10-chaves-em-bloco.test.ts`

| Caso | Espera |
|:---|:---|
| `poseAt` no `walk` em 0,25 (entre chaves) | um item por linha, com o valor interpolado |
| colar essa pose em `idle` no tempo 0 | chaves criadas; `revert` devolve o JSON |
| `rippleMove` de 0,17 por +0,1 | 0,17 → 0,27 e 0,5 → 0,6; 0 fica |
| `pasteToAllKeys` com um valor | toda chave da linha tem o valor |
| `removeTimelines` do `hips` | nenhuma linha do `hips`; as outras iguais |
| `keyAllNow` | uma chave por osso e slot animável no tempo atual |

### Manual

Capítulo 3, "Chaves": copiar a pose, colar em todas, ripple, cortar, chavear tudo. Inglês igual.

---

## Lote 11 → v2.8 · Itens 103, 105, 106, 110, 114, 102, 62 · Arquivo e ajuda

### O que muda

| # | O que | Tecla | Onde |
|:---:|:---|:---:|:---|
| 103 | **Repetir a última exportação** | Ctrl+Shift+E | menu Arquivo. Guarda as últimas opções de imagem, glTF e pele em `localStorage` |
| 105 | **Reabrir o fechado** | — | menu Arquivo. O rascunho (`doc/rascunho.ts`) já guarda; é ligar |
| 106 | **Configurações do projeto…** | — | menu Arquivo: FPS (`skeleton.fps`), cor de fundo da cena, tamanho da grade. Uma janela |
| 110 | **Paleta de comandos** | Ctrl+Shift+P | menu Ajuda. Caixa de busca sobre `allMenus`: digita, filtra por nome, Enter roda `runAction`. Mostra o atalho ao lado |
| 114 | **Barra muda com o modo** | — | Montagem: Criar osso, Ponto, Caixa, Malha, Pesos. Animando: Selecionar, Mover, Girar, Escalar, Posar, Inclinar. A ferramenta que não vale fica escondida, não cinza |
| 102 | **Prévia em tela cheia** | F11 na Prévia | botão na Prévia: `requestFullscreen` no canvas. Esc volta |
| 62 | **Imagem de referência** | — | menu Exibir → "Imagem de referência…": PNG atrás de tudo, com opacidade, posição e escala. Guardado no **navegador** (IndexedDB, chave = caminho do arquivo), nunca no `.bone`. Posição e opacidade em `RECORTE_editor_state.reference` |

### Como construir

| Peça | Como |
|:---|:---|
| 110 | `ui/palette.ts`: `filterCommands(allMenus, texto) → entradas` puro, sem acento e sem maiúscula. A janela é `dialog.ts` com uma lista. Setas andam, Enter roda |
| 114 | `getTools()` ganha `modes: ('montagem' \| 'animando')[]` por ferramenta. `buildToolbar` filtra por `doc.animation === null`. `toolsForMode(tools, mode)` puro |
| 103 | `io/last-export.ts`: `saveLastExport(kind, options)`, `loadLastExport(kind)`. Sem opções guardadas, abre a janela normal |
| 106 | `panels/properties-model.ts` já tem `skeletonFields`. A janela reaproveita os mesmos campos. Cor de fundo já está em `view.background` |
| 62 | `viewport/reference.ts`: `ReferenceImage { blob no IndexedDB, x, y, scale, opacity }`. Desenha antes da grade. `io/idb.ts` mínimo: `put`, `get`, `del` |

### Testes — `editor/testes/lote11-arquivo-e-ajuda.test.ts`

| Caso | Espera |
|:---|:---|
| `filterCommands(menus, 'chav')` | inclui "Chavear" e "Apagar chave"; não inclui "Abrir" |
| `filterCommands(menus, 'CEBOLA')` | acha "Casca de cebola" |
| `toolsForMode(tools, 'animando')` | sem Criar osso, Ponto, Caixa |
| `saveLastExport` + `loadLastExport` | o mesmo objeto |
| `reference` em `RECORTE_editor_state` | grava e lê `x`, `y`, `scale`, `opacity`; sem a imagem, não quebra |

### Manual

Capítulo 1: a paleta de comandos ("não acha? Ctrl+Shift+P"). Capítulo 2: imagem de referência. Capítulo 6: repetir exportação. Inglês igual.

---

## Lotes 12 e 13 · Itens do pesquisador

Spec no `08`. Ordem e conteúdo iguais aos lotes 7, 9 e 10 do `07`. Nada a acrescentar do código além do que os lotes acima já expõem: `ui/actions.ts`, `ViewSettings`, `transport`, `RECORTE_editor_state.timeline`.

O item 21 (Inclinar, Z) é o único com conta nova: `bone.shearX`/`shearY`, alças próprias, chave em Animando. Molde: `rotate.ts`. Nome da chave: "Inclinação X" e "Inclinação Y".

---

## Rodada 3 — o que ficou, e por quê

| # | O que | Por quê ficou |
|:---:|:---|:---|
| 54, 55 | descendentes, andar na hierarquia | conforto de teclado, não destrava nada |
| 60 | mapa da cena | painel novo, custo M, ganho pequeno com o zoom no canto |
| 63, 64, 65 | zoom fixo, guias e imã, qualidade | depois do lote 4 medir se falta |
| 68, 69, 71 | Alt cria em qualquer ferramenta, clonar, mover origem | gesto do Spriter que colide com Alt de outras ferramentas nossas |
| 74 | redimensionar esqueleto | mexe em tudo; precisa de caso de conformidade |
| 76, 78 | pilha de peles, colar malhas | **mudam o formato**: decisão do Humberto |
| 77, 79 | malha automática, seleção macia | malha já tem silhueta; macia é M |
| 94, 96, 97, 98, 99, 101 | deslocar quadros, assar física, rastro, foto, cebola por marca, sincronia | animação avançada; o lote 9 e 10 primeiro |
| 104, 107, 108, 109 | importar de outro `.bone`, boas-vindas, exportar em lote, CSV | arquivo; a linha de comando já cobre 108 |
| 111, 112, 113, 115, 116 | dicas instantâneas, duplicar vista, abas, aviso de novidade, menu por modo | acabamento |

---

## Ordem de trabalho para o executor

1. Terminar a rodada 1 inteira (v1.6 a v2.0) antes de abrir este plano.
2. Um lote por versão, na ordem da tabela. Backup antes. Testes, `tsc`, conformidade, headless, versão.
3. Depois de cada lote: uma mensagem curta ao Humberto e ao chat de progresso. O que entrou, quantos testes, o que ficou.
4. Item que não bater com o código: parar, escrever em "Desvios" no fim deste arquivo, seguir para o próximo item do lote.
5. Precisou de runtime, ferramentas, formato ou conformidade: chamar a sessão que construiu o Recorte.

---

## Desvios

Escrito pelo executor, no fim de cada lote. O que o plano dizia, o que o código
pedia, e o que ficou. Nada foi inventado por cima.

### Lote 4 → v2.1

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "Ícones: conjunto **Lucide** (MIT), citado no `NOTICE`" | Eu não tenho como conferir os traçados do Lucide desta máquina, e escrever um desenho meu com o crédito "Lucide" seria uma atribuição falsa no `NOTICE` — que é justamente o arquivo onde a atribuição tem que estar certa | Os ícones são **desenhos nossos**, em `ui/icons.ts`, feitos de linhas, círculos e retângulos, 24×24, `currentColor`. O que o plano queria de verdade — SVG embutido, nada de CDN, o editor abrindo sem internet — está cumprido. O `NOTICE` não ganhou linha nenhuma, porque não há nada de terceiros aqui |
| 2 | "Pronto quando: **60% ou mais** da janela é cena, em 1440×900" | Medido antes: **32%**. Depois de tudo o que o lote manda: **55%**. Os 5 que faltam só sairiam da faixa de baixo, que já está em 240px para um conteúdo de 208px de tocador, barra de chaves, régua e linha Resumo | Ficou em **55%**, e está escrito como não alcançado no CHANGELOG e aqui. Tirar mais 70px da faixa deixaria a folha de chaves sem uma linha à vista, o que é trocar um número por uma ferramenta pior. A conta de cada parte está no `conferir-editor.mjs`, que agora imprime todas |
| 3 | "**Compensar** sai da barra e vai para o painel Propriedades" | O painel não sabia qual ferramenta está ativa | Ele passou a ouvir `onActiveToolChange` e a se redesenhar. `COMPENSATION_TOOLS` — Mover, Girar, Escalar — está escrito num lugar só |
| 4 | "**Eixos** vira um `<select>` com três palavras" | `syncSpaceButtons` acertava três botões que já não existem | Virou uma linha só: escreve o valor na lista. Os botões saíram, e com eles o mapa `spaceButtons` deixou de ser preenchido |
| 5 | "`toolbarItems()` devolve a lista de botões" | Ela precisa das ferramentas registradas, e um teste só as tem se importar os módulos delas | `toolbarItems(tools = getTools())` aceita a lista de fora. O teste importa as oito ferramentas e passa a lista real |

### Lote 5 → v2.2

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "`AddPointAttachment(osso, x, y, rotation)` … cria o anexo na pele editável (`editableSkin`)" | `editableSkin` é de `onion.ts`, e `tree-model.ts` é módulo puro que não deve depender do estado global de exibição | O comando **recebe** as peles visíveis de quem chamou, e escolhe a primeira delas. A ferramenta passa `visibleSkinsOf(doc)`. O teste passa a lista que quiser, sem estado global nenhum |
| 2 | "Árvore: Novo → Ponto e Novo → Caixa (as entradas cinza do lote menus ficam vivas)" | Um ponto precisa de um LUGAR e uma caixa de um TAMANHO. Criar pelo menu, sem gesto, poria os dois na origem do osso, e a pessoa teria que caçar o que acabou de criar | As duas entradas **escolhem a ferramenta** e dizem o gesto na barra de baixo. Ficaram vivas, como o plano manda, e o que elas fazem é o que faz sentido |
| 3 | "Caixa: `AddBoundingBox(osso, vértices)`: 4 vértices em torno do osso" | "Em torno do osso" seria uma caixa de tamanho arbitrado por mim | Os quatro vértices vêm do **arrasto**, de canto a canto, convertidos para o espaço do osso. `boxVertices` é pura e devolve sempre a mesma ordem, seja qual for o canto por onde se começou — um contorno que se cruza é L2 no formato |
| 4 | "Propriedades — Caixa: nome, vértices (só leitura), cor" | Dezesseis números num campo de texto é um convite a quebrar o contorno sem perceber | O campo diz **"4 cantos — arraste com a ferramenta Malha"**, sem ponteiro. Só leitura de verdade: não há como escrever nele |
| 5 | Nada sobre captura de ponteiro | `setPointerCapture` estoura com um `pointerId` que o navegador não conhece, e o estouro abortava o `pointerdown` inteiro: a ferramenta nunca via o clique | A captura virou `try/catch`. É comodidade — segura o arrasto quando o cursor sai do canvas —, não condição para editar. Sem isto, nenhuma das duas ferramentas dava para conferir por script |

### Lote 6 → v2.3

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "`AddClipping(osso)` cria slot e anexo `clipping` … `end` = último slot" | O slot novo entrava no FIM do array, que é o fim da ordem de desenho — e uma máscara recorta do slot dela **em diante**. No fim, ela não alcançaria nada e pareceria quebrada no primeiro uso | O slot da máscara entra na **frente** da ordem de desenho. `end` é o último slot que existia antes dela. Está escrito no comentário do comando, com o motivo |
| 2 | "Propriedades: **Só estes** (caixas)" | Não havia tipo de campo para "um array de nomes": o painel só sabia texto, número, caixa, lista e cor | Entrou o tipo `checklist`. Ele grava a lista na ordem das opções, e não na ordem dos cliques, para o arquivo não mudar quando ninguém mudou nada |
| 3 | "Item 2: com um **desenho** escolhido … Mover/Girar/Escalar mexem em `x`, `y`, `rotation`, `scaleX`, `scaleY` do anexo" | Um `mesh` não tem esses campos — a forma dele mora nos vértices — e um `boundingbox`, um `point` e uma máscara não são desenho | Vale para `region`, que é o que tem esses cinco campos. Nos outros, `pickedAttachment` devolve `null` e as ferramentas não fazem nada, em vez de escrever um campo que o tipo não tem |
| 4 | "Teste: `render-png` do esqueleto do lote 0 tem menos pixels desenhados com máscara" | `render-png` é ferramenta de linha de comando e desenha com o runtime, que já recorta e já tem caso de conformidade para isso (`clipping` está nos casos B). Repetir a prova do runtime num teste do editor mede o runtime, não o editor | O teste do editor prova o que é **do editor**: que a máscara nasce onde recorta, com o `end` certo, com os campos certos, e que desfazer devolve o arquivo. O recorte em si continua provado pela conformidade |

### Lote 7 → v2.4

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "`cleanView: ViewSettings \| null` (o guardado do 61)" | Guardar o `ViewSettings` inteiro faria sair do modo desfazer também o que a pessoa mudou de propósito **enquanto ele estava ligado** | Guarda só os dez interruptores que o modo desliga (`CleanSnapshot`). Sair devolve esses dez, e nada mais |
| 2 | "`toggleCleanView(view)` … desliga ossos, nomes, pontos, caixas, máscaras, malhas, arestas, pesos, grade, eixos e cebola" | A cebola (`onion.enabled`) mora dentro de um objeto aninhado, e desligá-la junto exigiria um caminho diferente dos outros dez | Ficaram os dez de primeiro nível, em `CLEAN_KEYS`. A cebola continua no seu próprio interruptor, ao lado. Está escrito na lista, que é dado e é o que o teste lê |
| 3 | "`picking.ts` já filtra travados; passa a filtrar escondidos também" | `isBoneLocked` e `isSlotLocked` são o que todo o `picking` consulta, e são também o que decide se o osso é desenhado mais claro | Escondido entrou **dentro** de `isBoneLocked`/`isSlotLocked` — o que não se vê não se clica —, e o desenho passou a pular o escondido antes disso. Assim nenhum lugar do `picking` precisou saber o que é "escondido" |
| 4 | Nada sobre os testes antigos do menu Exibir | Três testes montavam um `ViewMenuState` à mão, e cada campo novo do painel quebrava os três de uma vez — aconteceu no lote 6 e de novo aqui | Entrou `editor/testes/ajuda-view.ts` com `viewMenuState()`. O que aqueles testes provam é o MENU, não a lista de campos da exibição |

### Lote 8 → v2.5

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | Item 73: "`Ctrl+F` abre a busca da Árvore (item 34) com um segundo campo" | **O item 34 não existe**: ele não está em nenhum lote desta rodada, e a busca da Árvore continua cinza no menu | "Substituir nomes…" ganhou porta própria em **Editar**, com uma janela de dois campos e **prévia ao vivo**. Quando a busca do item 34 chegar, ela pode chamar a mesma `renameMany` |
| 2 | Item 75: "a lista do item 9 mostra a imagem do atlas, 24 px, ao lado do nome" | Um `<select>` do navegador **não carrega imagem**. Trocá-lo por uma lista feita à mão custaria o teclado que ele dá de graça: as setas, o digitar para achar, o `Esc` | A miniatura está em **cada linha de desenho da Árvore**, que é uma lista de botões de verdade, e **ao lado** do campo "Anexo", mostrando o escolhido. O ganho — reconhecer a peça de relance — está entregue nos dois lugares |
| 3 | Item 72: "`resetToSetup` … `keyTargetsNow` com o valor de `setupValueFor`" | `keyValuesNow` recusa quando "Gravar sozinho" está desligado, e "voltar à pose de repouso" é um comando pedido com a tecla, não um arrasto gravado sozinho | Vai pelo `EditKeys` direto, como o botão Chavear. Grava com a gravação automática desligada, que é o que se espera de um comando |
| 4 | Item 67: "`RedrawBone(...)` com a mesma conta de `compensate.ts` para segurar os filhos" | `compensate.ts` trabalha sobre um plano tirado do documento ANTES do gesto, e aqui o pai muda de forma no mesmo comando | `redrawPlan` calcula o pai novo e recoloca cada filho no espaço dele, sem passar pelo `compensate`. Ficou puro e testável: o teste confere que o filho não saiu do lugar do mundo, com tolerância de 1e-6 |
| 5 | Item 56: "`invertSelection(file, selection) → Selection`" | Ela precisa saber o que está travado e o que está escondido, e isso mora no estado global de exibição — que um módulo puro não deve ler | Ela **recebe** as duas perguntas (`canPick.bone`, `canPick.slot`). A cena passa as de verdade; o teste passa as que quiser |

### Lote 9 → v2.6

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | Item 100: "lista ao lado de Repetir: Parar · Repetir · Vai-e-volta · Voltar ao início" | Com só esses quatro, escolher um deles faria o tocador **ignorar** o `Repetir` da animação sem avisar — e o `Repetir` é o que o jogo vai fazer | Entrou um quinto, **"Como o arquivo diz"**, e ele é o padrão. Os outros quatro são jeitos de olhar, e a dica de cada um diz isso |
| 2 | Item 82: "`M` com a linha do tempo em foco cria uma marca" | `M` já é a tecla da ferramenta **Malha** | A marca é tratada no `onKeyDown` da folha, que para o evento ali. Com o foco na cena, `M` continua sendo a Malha. Por isso a marca **não** entrou no mapa de atalhos dos menus: lá ela valeria na janela inteira e brigaria com a ferramenta |
| 3 | Item 82: "duplo clique dá nome" | Não há campo de texto flutuante no editor, e criar um só para isto seria um widget novo para uma coisa que se usa uma vez por marca | Usa a caixa de texto do navegador (`prompt`), como o "Renomear animação" já fazia. Está anotado como dívida junto com aquele |
| 4 | "trecho de laço e marcadores são de sessão do editor: `RECORTE_editor_state.timeline`" | Escrever ali sem `Command` não entra na pilha de desfazer | É de propósito, e é o mesmo caminho das travas e das opções de exibição: encher a pilha de desfazer com "pus uma marca" tiraria de lá o passo que interessa. Está escrito no comentário de `saveTimeline` |
| 5 | Item 95: "`dopesheetGroups` recebe `onlySelected: Selection \| null`" | `keying.ts` é módulo de baixo nível e não deve depender do tipo `Selection` do contrato do editor | Recebe `{ bones, slots }`, que é o que ele usa. O painel monta esse par a partir da seleção, contando o slot de cada desenho escolhido |

### Lote 10 → v2.7

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | Item 85: "`poseAt(file, animação, tempo)` com o `valueAt` de **todo alvo animado**" | Um `event` não tem "valor agora": ele acontece ou não acontece. Copiar a pose e colar em outra animação criaria disparos de som e de golpe que ninguém pediu | `poseAt` pula as linhas de evento. Está escrito no comentário e o teste confere: dois itens numa animação que tem três linhas |
| 2 | Item 84: "`keyAllNow(doc)`: `keyTargetsNow` com `allTargetsOf` (já existe)" | `allTargetsOf` devolve os alvos das linhas que JÁ existem. "Chavear tudo" com ele não gravaria nada do osso que ainda não foi animado — que é justamente o caso de quem aperta isso na primeira pose | Monta a lista de todo osso e todo slot, e soma as linhas existentes sem repetir. `targetsForSelection` passou a aceitar só `{bones, slots}`, para servir aos dois |
| 3 | Item 89: "`rippleMove` … junta às `refs` toda chave das mesmas linhas com `time > min(refs)`" | Movendo para a direita, a chave empurrada podia cair em cima da seguinte antes de esta sair do lugar | As chaves são ordenadas antes de mover: as de trás primeiro indo para a direita, as da frente primeiro indo para a esquerda. Assim duas nunca disputam o mesmo instante no meio do caminho |
| 4 | Nada sobre a seleção depois do ripple | `moveKeys` devolve TODAS as movidas, inclusive as empurradas, e o painel marcava todas | Só as que a pessoa arrastou continuam marcadas. Marcar as empurradas mudaria a seleção pelas costas |

### Lote 11 → v2.8

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | Item 114: "Animando: Selecionar, Mover, Girar, Escalar, **Posar**, Inclinar" — a lista deixa Posar fora de Montagem | A ferramenta Posar dobra a corrente de ossos, e em Montagem ela dobra a corrente da POSE DE REPOUSO. Escondê-la ali tiraria uma função que funciona hoje | Posar fica nos DOIS modos. Só as cinco de estrutura — Criar osso, Ponto, Caixa, Malha e Pesos — somem em Animando |
| 2 | Item 106: "tamanho da grade" | A grade não tem tamanho fixo: ela se refaz a cada zoom para as linhas caírem em 1, 2, 5, 10 e nunca virarem borrão. Não havia número nenhum para ajustar | Entrou `ViewSettings.gridPixels`, que é de quanto as linhas não podem chegar mais perto na TELA. É o botão que existe: menor = grade mais fina. Cortado em 8..400 |
| 3 | Item 103: "repete a última exportação" | Onde gravar é pergunta do navegador, sempre. Nenhum programa de dentro de uma aba escreve em disco sem ela | O que se repete são as OPÇÕES; o navegador continua perguntando o destino. Está escrito na janela e no manual, para ninguém achar que é falha do editor |
| 4 | Item 103, glTF e pele | glTF não tem janela de opções (é só o seletor de arquivo), e a pele grava um arquivo por vez pelo seletor | Repetir glTF e pele chama a mesma ação de antes. Só a exportação de imagem, que tem oito opções, é repetida sem perguntar |
| 5 | Item 110: "a janela é `dialog.ts` com uma lista" | `dialog.ts` tinha mensagem, tabela, opções e formulário — nenhum com campo de busca e lista que anda com as setas | Entrou `askPick` em `dialog.ts`, genérico: campo em cima, lista embaixo, setas andam, `Enter` escolhe, `Esc` fecha |
| 6 | Item 62: "IndexedDB, chave = caminho do arquivo" | Um `.bone` aberto pelo seletor do navegador não tem caminho no disco — o navegador não o entrega | A chave é o NOME do arquivo de imagem (`referencia:guia.png`). Duas imagens de mesmo nome em pastas diferentes disputariam a chave; o preço é uma troca de guia, e não um arquivo corrompido |

### Lote 12 → v2.9

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | Item 19: "dois grupos: Árvore · Propriedades / Animações · Exibição · **Prévia**" | O item 30, do mesmo lote, manda a Prévia para a faixa de baixo. Os dois não podem valer ao mesmo tempo | A Prévia foi para a faixa de baixo (item 30) e o grupo de baixo ficou com Animações, Exibição e Malha |
| 2 | Item 20: "uma linha por tipo com **três caixas**" | Travar só existe para osso e para desenho, e nome não existe para máscara nem para malha. Seriam dez caixas mortas em dezoito | Onde a caixa não existe, a célula fica VAZIA. Está escrito em `TYPE_ROWS` e o teste confere quais linhas têm o quê |
| 3 | Item 20: "nome = `boneNames` e novos" | Não bastava criar o campo: uma caixa que não desenha nada é uma caixa que mente | Entraram `slotNames`, `pointNames` e `boxNames`, e os três desenham mesmo, por um `drawLabel` só |
| 4 | Nada sobre painel dobrado | `CLOSED_PANELS` mandava três painéis nascerem dobrados. Numa tira de abas, dobrar não quer dizer nada | A lista ficou VAZIA, e não apagada: dois testes a citam, e apagá-la esconderia que a decisão mudou |
| 5 | Item 28: "o painel Exibição perde a seção" | Os campos da cebola usavam cinco funções privadas do `view-panel.ts` | As cinco foram para `panels/dom.ts`, e os dois lugares chamam as mesmas. Copiar daria dois campos de número que se parecem e não se comportam igual |
| 6 | Nada sobre a conferência sem cabeça | Com a Prévia na faixa de baixo, o `<option>` escrito "walk" dela passou a vir ANTES da lista de animações no documento, e o script clicava nele | A busca do script passou a ser dentro de `.panel-column` e a pular `OPTION`. Está comentado no próprio script |
| 7 | Item 19: "Tab dá a cena inteira" — sem número | — | **Medido: 55% → 82% da altura da janela, e de volta a 55%.** O item 15 (cena com 60%) fecha aqui, como o Planejador previu |

### Lote 13 → v3.0

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | Item 26: "menu escrito no losango: Linear · **Suave** · Parada" | O formato não tem a palavra "suave" (9.3): tem `linear`, `stepped` e uma Bézier de quatro números por componente. Uma string desconhecida vira `linear` (2.5), e a animação sairia diferente no jogo | "Suave" grava a Bézier clássica de sair e chegar devagar: alças a um terço do caminho no tempo, na altura de cada ponta. A conta é `smoothCurve`, pura e conferida sozinha |
| 2 | Item 26, nada sobre a última chave | A curva é sempre DESTA chave até a próxima (9.2). Escrever na última não faria nada no jogo e deixaria um campo que ninguém lê | A última chave de cada linha é pulada, e o número devolvido conta só o que mudou de verdade |
| 3 | Item 33: "Colar âncora nos escolhidos" | Colar escreve os cinco campos, inclusive os que valem o padrão. Guardar "os cinco de antes" no desfazer devolveria `rotation: 0` onde o arquivo não tinha campo nenhum — igual no jogo, diferente no disco | O desfazer guarda QUAIS campos existiam, e apaga de volta os que não existiam. O teste compara o arquivo inteiro, texto contra texto |
| 4 | Item 31: "Ctrl+Shift+V cola o valor copiado em todos os tempos de chave" | Já estava entregue: ele é o mesmo gesto do item 86, do lote 10 | Nada de código novo. Um teste confere que a entrada continua ligada e com a tecla escrita ao lado |
| 5 | Item 27: "arrastar estica com a outra ponta fixa" | Puxar a ponta esquerda para além da direita daria fator negativo, que ESPELHA a seleção sem aviso | O fator é preso num mínimo de 0,01. Espelhar continua sendo o `-1` do campo Fator: é um gesto que se pede, não um que acontece por acidente |
| 6 | Item 21: "arrastar inclina `shearX`/`shearY`" | Um anexo não tem inclinação própria no formato. As outras ferramentas de transformação caem no desenho quando não há osso escolhido | Inclinar não mexe em desenho: sem osso escolhido ela não faz nada. Inventar um campo aqui criaria algo que nenhum leitor entende |
| 7 | Item 21, nada sobre Chavear | `BONE_KEY_PROPERTIES` tinha cinco propriedades. Inclinar em Animando daria um valor que o próximo Chavear esqueceria | `shearX` e `shearY` entraram na lista. Um teste do lote 3a foi atualizado, com o porquê escrito nele |
