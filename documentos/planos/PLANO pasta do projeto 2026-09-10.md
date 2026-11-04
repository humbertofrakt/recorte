# PLANO pasta do projeto — começar como o Spriter · 10/09/2026

Planejador → executor. Quatro lotes, **59 a 62**, só bolo. Entram **depois do 58** (pivô e Animando) e **antes** do que faltar de 49 a 52.

## O que o Humberto pediu, 10/09/2026

> Para começar o projeto, a gente segue o caminho do Spriter. Ele pede para **abrir uma pasta**. Os arquivos da pasta ficam **na lateral**, e a gente **arrasta para dentro** para montar o personagem. Quero clicar na mão com o **botão direito** e **escolher outra mão**. Para organizar, as mãos todas numa **pasta**, as cabeças noutra. Um canto para organizar os **pivôs**: as mãos saem do Photoshop alinhadas, eu clico no pivô de uma e peço para **repetir para todas da mesma pasta**. Não conflita com braço nem arma: cada um tem a sua pasta. Ao **salvar** em `.bone`, o programa **empacota o atlas** e o resto.

E: **"no Spriter não existe importar imagens."** Certo. O **Importar → Imagens…** sai.

E, depois: **"Quero montar como no Spriter: a arte das peças para dentro, e depois faço os ossos. Hoje, quando arrasto a imagem para a tela, ela fica presa a um osso inicial. Não quero isso."** Então: imagem solta na cena é **livre** (fica na raiz, que é o mundo). Osso vem depois e **pega** os desenhos.

## O defeito que motivou (foto de 10/09)

Ao importar 12 imagens (`01 (1).png` … `01 (12).png`), elas entraram numa **fila de 7.000 px** e a cena foi para 9% de zoom. É o `layout: 'fila'` do `import-images.ts` (linhas 411–415). Com a pasta do projeto, imagem **não entra na cena sozinha**: só quando arrastada, onde foi solta. O defeito some com o lote 59. **Executor:** antes de tirar o Importar, reproduza com esses nomes (espaço e parênteses) e veja se além da fila houve erro no console; se houve, anote em Desvios e corrija no 59.

## Como o Spriter faz (pesquisa, `Spriter - todas as funcoes 2026-09-08.md`, linhas 70–76, 111, 167)

| Spriter | No Recorte |
|:---|:---|
| **File Palette** espelha as pastas do disco: subpastas, imagens, sons | aba **Imagens** passa a mostrar a pasta do projeto, por subpasta |
| Arrastar do File Palette para a cena cria o sprite | já existe (`DropImageAsSlot`); passa a vir da pasta |
| O campo de imagem do sprite abre a lista das imagens da **mesma pasta**; botão direito no File Palette troca o escolhido | campo **Imagem** nas Propriedades e clique no desenho escolhido abrem a lista da mesma subpasta; botão direito na paleta aplica ao escolhido |
| Duplo clique na imagem: diálogo do pivô; Copy / Paste Default Pivots | lote 58, mais **Repetir para a pasta** |
| Reload All Images | botão **Recarregar** na aba Imagens |
| Atlas é exportação (TexturePacker), não edição | o atlas nasce **ao salvar** |

## O que há hoje, e o que muda

| Hoje | Onde | Passa a |
|:---|:---|:---|
| Abre **arquivos** (`showOpenFilePicker`, `pickFilesToOpen`), nunca pasta | `open-save.ts` 166–199 | **Arquivo → Abrir pasta…** (`showDirectoryPicker`; sem ela, `<input webkitdirectory>`) |
| Importar imagens **empacota na hora** (`packAtlas` em `build`, 292) e joga na cena em fila | `import-images.ts` | imagem da pasta fica **só na paleta**; entra na cena quando arrastada; o atlas é montado **ao salvar** |
| Paleta é lista **plana**, na ordem do atlas (`paletteEntries`, 77–91) | `palette-model.ts` | agrupada por **subpasta**, dobrável, com busca |
| Campo Desenho é uma lista de nomes; botão direito na cena só cancela o menu nativo (`viewport.ts` 1268) | `properties.ts`, `viewport.ts` | lista de **miniaturas da mesma subpasta**, pelo botão esquerdo |
| Menu flutuante duplicado em `tree.ts` 632–686 e `palette.ts` 302–348 | dois lugares | um só: `ui/floating-menu.ts` `openFloatingMenu(x, y, items)` |
| Nome de região pode ter `/` (§10.3; `regionNameFromPath`, `packer.ts` 168) | formato | o nome da região **é o caminho relativo** sem extensão: `maos/mao_aberta` |

---

## Lote 59 — Abrir pasta; a paleta mostra a pasta · próxima versão livre

**Módulo novo** `editor/src/io/project-folder.ts`:

| Função | Faz |
|:---|:---|
| `openProjectFolder()` | `showDirectoryPicker({ mode: 'readwrite' })`; varre recursivo; guarda `{ handle, files: FolderImage[] }` no documento. `FolderImage = { path: 'maos/mao_aberta.png', name: 'maos/mao_aberta', handle, width?, height? }`. Sem picker: `<input type=file webkitdirectory>` (só leitura; salvar cai no download, como hoje) |
| `folderTree(names)` **pura** | lista de nomes → árvore de subpastas: `['maos/a', 'maos/b', 'cabecas/c', 'solta']` → `[{ folder: 'maos', images: [a, b] }, { folder: 'cabecas', images: [c] }, { folder: '', images: [solta] }]`, pastas em ordem alfabética, imagens em ordem natural (`01 (2)` antes de `01 (10)`) |
| `reloadFolder()` | relê a pasta: imagens novas entram, apagadas saem da paleta (as que estão em uso ficam, marcadas *arquivo sumiu*), pixels mudados atualizam a cena |
| `rememberFolder()` / `recentFolder()` | o `FileSystemDirectoryHandle` no IndexedDB, como `recent.ts` faz com arquivos; **Abrir recente** lista pastas também |
| decodificação **preguiçosa** | a miniatura e os pixels só são lidos quando a imagem aparece na paleta ou entra na cena. 500 imagens abrem sem travar |

**O que some:** `Arquivo → Importar → Imagens…` (`menus.ts` 203) e o layout `fila/pilha` do `import-images.ts`. Soltar PNG na janela **continua**, mas vai para a **paleta**, não para a cena. O acervo do PSD (`fase6`) continua: PSD é outra coisa.

**A aba Imagens** (`palette.ts`): seções por subpasta, dobráveis (o estado de dobra no navegador), busca sobre todas, miniatura, o número de usos como hoje, botão **Recarregar** (ícone, nome na dica) e **Abrir pasta…** quando não há pasta. Imagem em uso mostra o ponto; imagem só na pasta, sem ponto.

| Teste | Esperado |
|:---|:---|
| `folderTree` com os quatro nomes acima | as três seções na ordem `cabecas, maos, (raiz)`; a raiz por último |
| `folderTree(['a/01 (10)', 'a/01 (2)'])` | `01 (2)` antes de `01 (10)` |
| `paletteEntries` com pasta aberta e atlas vazio | lista as imagens da pasta com `uses = 0`; a busca `mao` acha `maos/mao_aberta` |
| `auditMenus` depois de tirar Imagens… | vazio; o submenu Importar tem 3 entradas (PSD…, PSD com ossos…, e a terceira de hoje) e `lote-menus` ajusta a conta |
| Importar 12 arquivos `01 (n).png` pela paleta | 12 entradas na paleta, **nenhum** slot criado, zoom da cena intocado |

**Pronto quando:** abrir a pasta `formato/exemplos/` mostra as imagens do herói na lateral, por subpasta, sem nada na cena.

---

## Lote 60 — Da paleta para a cena, e trocar a imagem pela lista da pasta · próxima versão livre

**Humberto, 10/09:** *"quero trocar as imagens como no Spriter: com o botão esquerdo ele abre as imagens que estão na pasta; mostra a imagem que está na mesma pasta."* Então o gesto principal é o **botão esquerdo**, numa lista de miniaturas da **mesma subpasta**. O botão direito é só atalho para o mesmo.

**A imagem da pasta na cena.** Ao arrastar (`DropImageAsSlot`) ou soltar num slot (lote 56), a imagem ganha uma **região provisória** no documento: página = a própria imagem, região = a imagem inteira, nome = caminho relativo. `imageFor(page)` devolve o bitmap decodificado da pasta. Nada é empacotado. `pivot-model.ts` funciona igual: é uma região como outra.

| Função pura | Esperado |
|:---|:---|
| `provisionalRegion(image)` em `project-folder.ts` | `{ name: 'maos/mao_aberta', page: 'maos/mao_aberta.png', x 0, y 0, width W, height H, originalWidth W, originalHeight H }`; pivô se a pasta tem um guardado (lote 61) |
| `sameFolderImages(names, name)` | `('maos/a', ['maos/a','maos/b','cabecas/c'])` → `['maos/a', 'maos/b']`; imagem da raiz → só as da raiz |

**Primeiro a arte, depois os ossos.** Hoje `onDrop` (`viewport.ts`, "Solta a imagem") pendura a imagem no osso **escolhido**. Passa a pendurar **sempre na raiz**: a raiz fica na origem, sem giro, então o desenho é livre, como o sprite sem pai do Spriter. Nenhuma seleção muda isso. Depois:

| Gesto | Faz | Já existe? |
|:---|:---|:---|
| **Criar osso** arrastando com desenhos escolhidos | o osso nasce (sob o osso escolhido, ou na raiz) e **pega** os desenhos escolhidos: viram filhos dele **sem sair do lugar** (`Reparent`, `doc/reparent.ts`, o do lote 34). Rodapé: *Osso novo pegou 3 desenhos* | metade: o `Reparent` sim; o Criar osso não olha a seleção |
| **P** segurado + clique no desenho | prende o desenho ao osso escolhido, sem mover | sim, lote 31 (`select.ts`, `targetOf` já devolve o slot) |
| Campo **Osso** nas Propriedades do desenho | troca o pai sem mover | sim, lote 34 |
| Arrastar o desenho para cima de um osso na **Árvore** | idem | sim, lote 34 |

Dica do botão Criar osso: *Arraste para criar. Com desenhos escolhidos, o osso novo pega os desenhos.*

**A raiz é invisível.** Foto do Humberto de 10/09, duas imagens soltas: *"estão presas a um osso maldito, eu não fiz esse osso"*. Era a raiz: a caixa do Transformar englobava o pivô dela na origem, com a haste. Para o desenho na raiz ser livre de verdade:

| Onde | Regra |
|:---|:---|
| Cena | a raiz **não se desenha** (nem traço, nem pivô) e **não se escolhe** com clique nem com retângulo. Ver ossos não a mostra. Continua no arquivo, na origem |
| **Transformar** com só desenhos escolhidos (`transform-box.ts`) | a caixa é o contorno **dos desenhos**; o pivô e a haste ficam no **centro da caixa**, não na origem do osso. Girar e escalar giram cada desenho em volta do centro comum, como o Spriter. Com um osso escolhido, como hoje |
| **Árvore** | os desenhos da raiz aparecem no **nível de cima**, sem a linha `root`. A raiz só aparece quando ela mesma tem valor diferente do padrão (alguém a moveu por arquivo), com o nome *raiz* e a dica *o mundo* |
| Propriedades de um desenho na raiz | o campo Osso mostra *nenhum (livre)*; escolher um osso na lista prende sem mover |

| Teste | Esperado |
|:---|:---|
| `transformBox` com 2 desenhos na raiz, caixas `(0,0)-(100,50)` e `(200,0)-(300,50)` | caixa `(0,0)-(300,50)`, pivô `(150,25)`; `transformHit` na origem do mundo → `outside` |
| pick na origem do mundo, sem osso além da raiz | `null`; retângulo sobre tudo escolhe os 2 desenhos e **nenhum** osso |
| `treeRows(heroi)` | primeira linha não é `root`; desenhos da raiz no nível 0 |
| arquivo com `root` movido (`x 10`) | a linha *raiz* aparece, com a dica |

| Teste | Esperado |
|:---|:---|
| soltar imagem com o osso `arm` escolhido | o slot nasce em `root`, não em `arm`; `x/y` no espaço da raiz = ponto do mundo |
| dois desenhos escolhidos, Criar osso de `(0,0)` a `(100,0)` | osso novo em `root`; os dois slots com `bone` = osso novo; posição de **mundo** de cada desenho igual antes e depois, em 1e-6; **um** passo de desfazer devolve os três |
| desenhos escolhidos e o osso `arm` escolhido | o osso novo nasce filho de `arm`; os desenhos vão para o novo |
| nenhum desenho escolhido | Criar osso como hoje |

**A lista da pasta (botão esquerdo).** Um componente só, `panels/image-picker.ts`: miniaturas das imagens da **mesma subpasta** do desenho, a atual marcada, busca em cima, setas do teclado para andar e `Enter` para escolher. Escolher = `SwapSlotImage` (já recoloca pelo pivô, lote 56). Em Animando com Gravar ligado = chave de Desenho, como o campo faz hoje. Abre em três lugares:

| Onde | Gesto |
|:---|:---|
| Painel **Propriedades** do desenho | o campo **Imagem** vira uma miniatura com o nome; **clique** abre a lista por baixo, como o campo de imagem do Spriter |
| **Cena** | clicar **de novo** no desenho que já está escolhido abre a lista ao lado dele. Arrastar continua movendo: só o clique parado abre |
| **Ficha rápida** | o mesmo campo Imagem |

Com `Shift` na escolha, troca **em todas as peles** (`SwapImageEverywhere`); a dica diz.

**Botão direito no desenho, na cena** (`viewport.ts`, o `contextmenu` da linha 1268): escolhe o desenho sob o cursor e abre o menu flutuante com **Trocar por…** (abre a mesma lista), **Trocar em todas as peles…**, **Definir pivô…**. Atalho para o mesmo, não caminho diferente.

**Botão direito na paleta** ganha **Usar no desenho escolhido**, que é o gesto do Spriter (troca o sprite escolhido por esta imagem). Cinza sem desenho escolhido, com a dica dizendo.

**Menu flutuante único:** `ui/floating-menu.ts` com `openFloatingMenu(x, y, items)`; `tree.ts` e `palette.ts` passam a usá-lo. Fecha em `Esc` e em clique fora; tecla tratada uma vez.

| Teste | Esperado |
|:---|:---|
| `pickerEntries(names, current)` puro, desenho `maos/mao_aberta`, pasta `maos/` com 3 imagens | 3 entradas, `mao_aberta` marcada, ordem natural |
| escolher `mao_fechada` | o anexo aponta para `maos/mao_fechada`, `x/y` pelo pivô, `width/height` ausentes; desfazer devolve por texto |
| clique parado no desenho já escolhido | a lista abre; clique e arrasto de 4 px **não** abre e move |
| desenho de imagem fora de pasta (atlas importado) | lista as do mesmo prefixo até a última `/`; sem prefixo, a lista mostra todas com a dica *abra a pasta do projeto para agrupar* |
| `openFloatingMenu` | fecha em `Esc`; `tree.ts` e `palette.ts` não têm mais `arvore-menu` próprio |

**Pronto quando:** soltar toda a arte livre na cena, arrumar, escolher a mão e criar o osso que a pega; e trocar a mão com um clique na lista da pasta, sem sair da cena.

---

## Lote 61 — Pivô por pasta · próxima versão livre

Extensão do **Definir pivô…** do lote 58.

| O que | Como |
|:---|:---|
| Caixa **Repetir para a pasta** no diálogo, ligada por padrão quando a imagem está numa subpasta | ao confirmar, aplica o pivô a **todas** as imagens da mesma subpasta. Mesmo tamanho = mesmo pixel; tamanho diferente = mesma **proporção** (a regra do Colar do lote 58). A mão saiu do Photoshop alinhada, então mesmo pixel é o caso comum |
| Onde o pivô mora para imagem **ainda fora da cena** | região provisória não vai para o arquivo. Fica em `RECORTE_editor_state.folderPivots: { 'maos/mao_fechada': [px, py] }` (estado só do editor, regra 6). Quando a imagem entra na cena, o pivô vai para a região; ao salvar, para o atlas (§10.3) |
| Anexos já na cena que usam imagens da pasta | recolocados por `placeByPivot`, no mesmo `Command`, com aviso de quantos |
| Braço e arma | cada subpasta é um grupo; **nada** atravessa pastas. Sem subpasta (raiz), a caixa fica desligada e diz por quê |

| Teste | Esperado |
|:---|:---|
| `folderPivotPlan(images, source, pivot)` puro, pasta `maos/` com 3 imagens 100×50 e uma 200×100, pivô `(40, 45)` na primeira | as três de 100×50 → `(40, 45)`; a de 200×100 → `(80, 90)`; `cabecas/` intocada |
| confirmar com 2 anexos usando imagens da pasta | os 2 recolocados; `revert` devolve pivôs, `folderPivots` e os 2 anexos por texto |
| salvar depois | `heroi.atlas.json` tem `pivotX/pivotY` nas regiões usadas; `folderPivots` guarda só as **não** usadas |

**Pronto quando:** definir o pivô numa mão e ver as outras cinco caírem no pulso ao trocar.

---

## Lote 62 — Salvar empacota · próxima versão livre

| O que | Como |
|:---|:---|
| Ao **Salvar**, **Salvar como**, `.bonez` e **Exportar por pele** | as regiões provisórias (imagens da pasta em uso) passam por `packAtlas` (`packer.ts` 746, `PackerItem { name, width, height, pixels, pivotX?, pivotY? }`), com `stampPivots` antes. O atlas e as páginas vão para **a pasta do projeto**, ao lado do `.bone`, pelo `handle` da pasta (não mais `getParent()`, que é fora do padrão). Sem `handle` de escrita: download, como hoje |
| Só o que está **em uso** entra no atlas | imagem que está só na paleta não entra. Um projeto com 500 imagens e 40 usadas salva 40 |
| Reabrir o `.bone` **dentro da pasta aberta** | as regiões continuam a apontar para os arquivos da pasta (frescos); o atlas salvo é para os leitores. Sem a pasta, abre pelo atlas, como hoje |
| **Reempacotar atlas** (menu de hoje) | sai do menu: reempacotar é o Salvar. Anotar em `auditMenus` e `lote-menus` |
| `packageBytes` (`save-binary.ts` 197–262) e `saveAtlasBeside` (`open-save.ts` 488–529) | uma função só decide: `atlasForSave(doc)` pura → `{ items, reuse }`; `reuse` quando nada provisório existe e o carimbo não mudou |

| Teste | Esperado |
|:---|:---|
| `atlasForSave` com 3 provisórias em uso e 2 só na paleta | `items` com 3, nomes com `/`, pivôs presentes |
| salvar → abrir sem a pasta → salvar de novo | o segundo arquivo **igual** ao primeiro, texto contra texto (`.bone` e `.atlas.json`) |
| `.bonez` por pele com imagens da pasta | o pacote abre no runtime; 53 casos intocados |
| pasta aberta só com `webkitdirectory` (sem escrita) | salvar baixa `.bone`, `.atlas.json` e as páginas; barra de estado diz por quê |

**Pronto quando:** abrir a pasta, montar, animar, salvar, fechar tudo, abrir a pasta de novo pelo recente e continuar de onde parou, com o atlas empacotado ao lado.

---

## Ordem de trabalho

1. Depois do 58: **59 → 60 → 61 → 62**. Depois o que faltar de 49 a 52. Versão: a próxima livre.
2. Backup antes; linha no `INDICE.md`; contagem de testes não cai; botão em ícone com nome na dica; tecla tratada uma vez; `tsc`; `conformidade.mjs` (os 53); `CHANGELOG`; `versao.py`.
3. Nada de campo novo no formato. Nome de região com `/` já é permitido pela §10.3. Precisou de campo: Desvios.
4. Manual pausado. As frases que o manual teria vão para as **dicas** dos botões.
5. Três linhas ao Humberto por lote. No fim do 62, atualizar o topo do `ESTADO.md` e "O que já funciona".

## Fica de fora, anotado

| O que | Por quê |
|:---|:---|
| Character maps do Spriter (guarda-roupa empilhável) | são as **peles** do formato; já existem. A troca pelo botão direito é o gesto simples |
| Sons na pasta | o formato não tem áudio |
| PSD como pele | `PLANO peças e mechas`; próximo passo natural depois deste |

## Desvios

### Lote 59 — v8.9

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| Reproduzir os 12 `01 (n).png` e ver se houve erro no console | Reproduzido no editor, no herói e no documento vazio, pelo mesmo caminho do arrasto | **A fila se repete** (x de 290 a 6.758, 7.000 px). **Nenhum erro** no console nem aviso no documento. A câmera não mudou sozinha: os 9% da foto vieram de enquadrar a fila. Nada a corrigir além de tirar a fila |
| `openProjectFolder()` guarda a pasta "no documento" | A pasta não é o `.bone` nem passo de desfazer | Guardada por documento num `WeakMap` do `project-folder.ts`, com `onFolderChange` para a aba e as boas-vindas. Novo esquece; Abrir… mantém (o lote 62 decide o `.bone` dentro da pasta) |
| Abrir pasta | Qual documento fica na tela | **Documento novo, vazio**, com a pasta. Pergunta antes de descartar trabalho sujo |
| `FolderImage.handle` | O `<input webkitdirectory>` e o PNG solto não têm handle | `FolderImage.read()` no lugar do handle: serve aos três caminhos |
| Soltar PNG sem pasta aberta | Onde a imagem mora | Numa pasta sem nome, só na memória ("Imagens soltas"). Não suja o arquivo |
| Imagem só da pasta na aba | Ela ainda não tem região: arrastar criaria um desenho sem imagem | **Não arrasta no 59.** O arrasto chega com a região provisória, no 60 |
| Boas-vindas (não estava no plano) | "Para começar o projeto… ele pede para abrir uma pasta" | **Abrir pasta** virou o primeiro dos quatro botões. O teste do lote 36 passou de 3 para 4 |
| `lote-menus` ajusta a conta | Mais três testes antigos provavam a fila e o item: `ferramentas/testes/atlas.test.ts` (1) e `ligacao-fase4.test.ts` (2) | Os três **reescritos para provar o contrário** (sem x, sem `importar-imagens`, com `abrir-pasta`). Nenhum apagado. Os trechos originais estão em `backup/lote59_2026-09-10_antes/` |
| Manual | O teste pulado do manual cita "Imagens…" | Fica: está pulado (`manual-pausado.ts`). Quando o manual voltar, trocar por "Abrir pasta…" |
| `formato/exemplos/` mostra o herói "por subpasta" | A pasta não tem subpastas: as peças do herói só existem dentro do `heroi.png` e do `heroi.psd` | Abre com as imagens da raiz (as páginas e as fotos). A prova de subpastas é o teste da varredura, com uma pasta de mentira `personagem/maos` |

### Lote 60 — v9.0

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| Região provisória: página = a própria imagem | A `heroi.png` da pasta taparia a página `heroi.png` do atlas do herói na hora de a cena buscar os pixels | O `image` da página provisória leva o prefixo `.pasta/`, que nunca vai para o disco. Todas as provisórias moram num atlas só, reconhecido por esse prefixo (`isProvisionalAtlas`) |
| `imageFor(page)` devolve o bitmap | O `Doc` já resolve pelo `image` da página | Nada novo no `Doc`: a região provisória entra por `setAssets`, como qualquer atlas. `folder-atlas.ts` faz isso antes do comando (arrasto, soltura, lista) |
| O atlas provisório | O salvar de hoje (`atlasFilesForDisk`) o gravaria como `atlas-2.atlas.json` | Fica de fora do disco desde já. Quem empacota as provisórias em uso é o lote 62 |
| Em Animando com Gravar = chave de Desenho | O formato chaveia qual desenho o slot mostra, não o `path` | `SwapImageAsKey`: o slot ganha um desenho com a imagem nova (copiado do de agora, posto pelo pivô), ou reaproveita o que já a mostra, e a animação ganha a chave. Montagem intacta; desfazer por texto |
| A cena abre a lista | A lista puxa as miniaturas, que puxam o painel de malha, que puxa a cena: círculo de módulos | A lista se registra em `ui/picker-hook.ts` e a cena chama por lá. Definir pivô… da cena chama o painel Imagens pelo registro (`getPanel`), sem ação nova (a auditoria exige porta para toda ação) |
| Clique parado abre a lista | Quais ferramentas | Selecionar, Transformar, Mover, Girar, Escalar e Inclinar. Criar osso, Ponto, Caixa, Malha, Pesos e Posar fazem outra coisa com o clique |
| Botão direito na cena só cancelava o menu nativo (plano) | Ele também voltava à ferramenta anterior (lote v1.6) | Em cima de desenho com imagem, abre o menu do desenho; fora, continua voltando à ferramenta anterior |
| — (achado na conferência) | O slot nascia com o nome da imagem inteira: `maos/mao_1`, com barra | O slot leva o nome sem a subpasta (`mao_1`); o `path` guarda o caminho. Tirou também o "2" falso na contagem de uso da aba |
| Menu flutuante único (lote 60) | O menu antigo lia as cores de `.painel` estando fora dele, e caía no tema claro | `.menu-flutuante` e a lista leem as cores da raiz: seguem o tema escuro. O teste do lote 29 que exigia `arvore-menu` na Árvore passou a exigir `openFloatingMenu` (copiado antes em `backup/lote60_2026-09-10_antes/`) |

### Lote 61 — v9.1

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| `RECORTE_editor_state.folderPivots` | O tipo `EditorState` mora no `contract.ts`, a lei do editor | Lido e escrito como chave a mais (`readFolderPivots`), **sem tocar no contrato**. O `Doc` já guarda as chaves que não conhece ao salvar |
| Mesmo tamanho = mesmo pixel; diferente = proporção | O tamanho de uma imagem que só está na pasta só se sabe lendo o arquivo | Antes do comando, as imagens da subpasta são lidas (são poucas). A que tem região usa o tamanho original da região |
| Estender o Definir pivô… do lote 58 | Ele só abria para imagem com região | Abre também para a imagem só na pasta, com os pixels lidos dela. Sem Repetir, o pivô vai só para `folderPivots` |
| "Salvar depois: `folderPivots` guarda só as não usadas" | Onde limpar a lista | `pruneFolderPivots` no Salvar, junto do estado do editor que o Salvar sempre grava (câmera, seleção). Sem passo de desfazer: a região já tem o pivô. O atlas da pasta com os pivôs sai no lote 62 |
| Recolocar os anexos que usam a pasta | Com que tamanho | O mesmo `placeByPivot(…, manter o tamanho)` do Definir pivô: o desenho não estica |

### Lote 62 — v9.2

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| `atlasForSave(doc)` pura → `{ items, reuse }` | Os pixels só se leem com canvas, que o teste não tem | `atlasForSave` é pura e devolve os itens **sem pixels** (nome, página, tamanho, pivô carimbado). Quem lê os pixels e empacota é `buildFolderPack`, no navegador. O teste empacota com pixels de mentira pelo mesmo `packForSave` |
| O nome do atlas | O herói aberto do disco já tem `heroi.atlas.json`; a página `heroi.png` poderia ser uma imagem da pasta | O atlas leva o nome do `.bone`, ou `heroi-pasta.atlas.json` quando o nome já é de outro atlas. A página é `heroi-atlas.png`, e ganha número se a pasta tiver uma imagem com esse nome: **gravar a página por cima da arte seria perder a arte** |
| O `.bone` cita o atlas | O `assets.atlases` tem que ter o nome antes de o texto sair | O nome entra no arquivo **no Salvar**, sem passo de desfazer, como o estado do editor. O conferir antes de salvar passou a vir antes da janela, e o texto é refeito depois dela, com o nome escolhido |
| "Pelo `handle` da pasta, ao lado do `.bone`" | Onde fica o `.bone` dentro da pasta | `resolve()` da pasta diz o caminho; o atlas vai para a mesma subpasta. `.bone` fora da pasta, ou pasta só de leitura: baixa, e o rodapé diz por quê. Sem pasta do projeto, o caminho de sempre (`getParent` ou baixar) |
| "Reabrir o `.bone` dentro da pasta aberta: regiões apontam para a pasta" | Como reconhecer o atlas salvo por nós | Atlas em que **toda região (e todo apelido) é uma imagem da pasta** é o nosso: sai da cena, e as provisórias voltam com o pivô dele (`adoptFolderAtlases`). Vale no Abrir, no Abrir recente, no soltar arquivo e no reabrir a pasta |
| "Abrir a pasta de novo pelo recente e continuar de onde parou" | O Abrir pasta do lote 59 começava sempre vazio | A pasta lembra o `.bone` salvo na raiz dela (no navegador). Reabrir a pasta reabre ele, e o `Ctrl+S` grava por cima. Pasta que nunca teve `.bone` salvo pelo programa (`formato/exemplos/`) continua abrindo vazia |
| — (achado ao desenhar) | A `heroi-atlas.png` gravada na pasta apareceria na aba como se fosse peça | A aba e a lista escondem as páginas de atlas que moram na pasta (`shownFolderNames`) |
| — (achado no teste) | O empacotador junta imagens iguais numa região com apelidos (§10.5) | O reconhecimento do atlas salvo e a volta das provisórias contam os apelidos |
| Exportar por pele | O `.bonez` por pele já reempacota tudo pelo fatiador | Funciona com as provisórias sem mudança: o fatiador lê as páginas pelos pixels e grava páginas novas. O modo `.bone` só aponta para o atlas do último Salvar, como antes |
| `lote-menus` ajusta a conta | O teste da fase 4 (`ferramentas/testes/ligacao-fase4.test.ts`) exigia o Reempacotar apagado sem imagens | Reescrito para provar que o item saiu. Copiado antes em `backup/lote62_2026-09-10_antes/ferramentas-testes/` |
| Manual | O teste pulado do manual cita "Reempacotar atlas" | Fica: está pulado. Quando o manual voltar, tirar a linha |

### Acréscimo ao lote 60 (primeiro a arte, depois os ossos) — v9.3

O lote 60 já tinha saído na v9.0 quando o acréscimo chegou. Foi feito como versão própria, depois do 62.

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| `onDrop` pendura sempre na raiz | A decisão estava dentro do `onDrop`, sem teste possível | `dropPlace` puro em `palette-model.ts`: a raiz e o ponto no espaço dela. A cena só chama |
| Criar osso pega os desenhos com o `Reparent` | Já havia o `Ctrl` do item 66 (`CreateBoneForSlots`), que só trocava o `slot.bone` e deixava o desenho pular | `CreateBoneAndGrab`: o osso entra, e o `Reparent` pendura os slots escolhidos nele sem mover. Um passo. O `CreateBoneForSlots` continua no código (os testes do lote 8 o usam), mas a ferramenta não o chama mais |
| — | Se pegar é o padrão, o `Ctrl` ficava sem função; e o teste do lote 29 exige `Ctrl` e `Alt` na frase do rodapé | O **`Ctrl` virou "cria sem pegar"**: a saída para quem quer um osso solto com desenhos escolhidos. Nenhum teste antigo mudou |
| — | Em Animando, trocar de pai é da Montagem (o `Reparent` sai de Animando, lote 34) | Em Animando o osso nasce sozinho, sem pegar, e o rodapé diz por quê |
| "sob o osso escolhido, ou na raiz" | Clicar num desenho na cena escolhe também o osso dele | O pai é o primeiro osso da seleção (`newBoneParent`): com a arte solta na raiz, é a raiz |
| P + clique, campo Osso, arrasto na Árvore | Só conferir | Os testes dos lotes 31 e 34 passam sem mudança |
| Conferência na cena | A porta 5173 estava ocupada por um `vite editor --open` que não foi aberto por este chat | Conferido nesse mesmo servidor (ele serve o código atual), sem derrubá-lo |

### Lote 60a — a raiz é invisível — v9.4

Pedido do planejador, 10/09: antecipar os dois acréscimos do lote 60 como um lote curto, "60a", antes do 55, porque é o que dói no teste do Humberto.

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| Antecipar os dois acréscimos antes do 55 | O 55 já tinha saído (v8.0), e o primeiro acréscimo (soltar na raiz, Criar osso pega) já era a v9.3 | O 60a é só **"A raiz é invisível"**, versão v9.4. A fila segue |
| A caixa do Transformar englobava o pivô da raiz | A causa era o clique: `selectionFor` escolhia também o osso do desenho, e o da arte solta é a raiz. Mover, Girar, Escalar e as setas mexiam **na raiz**, com todo desenho solto junto | Clicar num desenho da raiz escolhe só o desenho (`selectionFor(…, root)`). Com um desenho só, as ferramentas já mexiam nele (item 2) |
| "Girar e escalar giram cada desenho em volta do centro comum" | Com dois ou mais desenhos e nenhum osso, as ferramentas não faziam nada: `pickedAttachment` só aceita um | `tools/drawing-group.ts`: Mover, Girar, Escalar e as setas em grupo, em volta do centro da caixa. Escala diferente nos dois eixos vai para o eixo do desenho mais perto do eixo da tela; com a mesma escala nos dois, a conta é exata |
| Teste: caixas (0,0)–(100,50) e (200,0)–(300,50); `transformHit` na origem → `outside` | Com esses números a origem é o canto `sw` da caixa: o toque dá `{ scale: 'sw' }` | Os desenhos andaram 10 para a direita e para cima: caixa (10,10)–(310,60), pivô (160,35). A origem fica fora |
| A raiz aparece na Árvore "quando alguém a moveu por arquivo" | Raiz animada também se mexe; esconder seria esconder um movimento | Aparece também com linha do tempo nela (`rootHidden`). No herói ela está parada e sem linha: some |
| Árvore: "desenhos da raiz no nível de cima" | A Árvore tem seções planas (Ossos, Slots, Desenhos); slots e desenhos já estão no nível 0 | Na seção Ossos a raiz sai e os filhos sobem um nível. Na seção Slots o detalhe diz *livre*, e não `root`. `boneRows` continua com a raiz: a ordem do arquivo depende dela |
| Campo Osso: *nenhum (livre)* | A raiz que aparece (movida ou animada) não é bem "livre" | *nenhum (livre)* com a raiz escondida; *raiz (o mundo)* quando ela aparece |
| — (achado no teste) | Cinco testes do lote 0 (`lote0-selecao-e-trava`) exigiam a raiz dentro do retângulo | **Reescritos para provar o contrário** (sem a raiz). Nenhum apagado. O original em `backup/lote60a_2026-09-10_antes/editor-testes/` |
| — (achado) | As setas, com só desenhos escolhidos, andavam com a raiz | Andam com os desenhos (`nudgeDrawings`), um passo por tecla |
| Conferência na cena | O painel do navegador ficou escondido no meio da conferência: a página para de desenhar, e o arrasto do retângulo caiu fora | Conferido no herói: a Árvore começa em `hips`, sem `root`; duas imagens soltas entram *soltas* (rodapé) e o painel diz *Slot: azul*, sem osso. A caixa com as duas ficou provada pelos testes (a mesma ferramenta e o mesmo `Doc` da cena), não na tela |
