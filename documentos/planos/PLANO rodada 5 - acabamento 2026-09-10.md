# PLANO rodada 5 — acabamento · 10/09/2026

Escrito pelo planejador. Para o executor.

**Ponto de partida:** v7.8 · **2.294 testes** · 53/53 nos dois runtimes · `auditMenus` vazio.
Conferido agora: `npx vitest run` → 92 arquivos, 2.294 passando.

## 0. De onde saiu esta lista

Li o `ESTADO.md`, o `PENDENCIAS 2026-09-09.md`, o plano da rodada 4 com todos os Desvios,
e a pesquisa do pivô. Separei o que está pendente em quatro caixas:

| Caixa | O que tem | Entra aqui? |
|:---|:---|:---:|
| Espera **decisão do Humberto** | as 18 do `ESTADO.md` ("Decisões em aberto"), D4 ponto animado, D5 pivô (campo no atlas), IK de N ossos, versão `0.9` | **não** |
| **Parado por ordem dele** ("programa primeiro") | runtime do socket, repositório, canal, licença, domínio, backup por gancho, C/C++ e engines | **não** |
| **Sem ferramenta nesta máquina** | T1, T3 | **não** |
| **Só trabalho, sem decisão** | acabamento do editor, confronto contra pasta, cobertura da suíte | **sim, é este plano** |

Ninguém pergunta nada das três primeiras caixas ao Humberto. Ele testa; nós fechamos o programa.

## 1. Os lotes, na ordem

Sete lotes. Os cinco primeiros são o **programa**, que é o foco dele. Os dois últimos são
prova de qualidade: entram se sobrar rodada.

| Lote | Versão | O que | Tamanho |
|:---:|:---:|:---|:---:|
| 48 | v7.9 | Quatro pequenos: arte em pixel de verdade, setas nos campos, cabeçalho que tapa, cap. 1 em inglês | pequeno |
| 49 | v8.0 | Avisos com nome de gente e botão **Ir para** (R11) | médio |
| 50 | v8.1 | Arrastar para **entre** duas linhas na aba Ordem | pequeno |
| 51 | v8.2 | Sequência de PNG num `.zip` só | pequeno |
| 52 | v8.3 | Altura dos painéis da direita arrastável | médio |
| 53 | v8.4 | `comparar-runtimes.mjs --pasta`: o confronto contra arquivos reais vira comando | meio dia |
| 54 | v8.5 | Cobertura da suíte: os sete recursos sem caso, mais seis casos que valem por si | uma fase |

Versão: a que o `versao.py` aceitar na hora. Se outro chat gravar no meio, pega o próximo livre e anota em Desvios.

---

### Lote 48 — quatro pequenos · v7.9

**a) Arte em pixel desliga o filtro (R9 [I]).** A caixa **Arte em pixel** (`pixelArt`, §4.1) é
gravada e lida, e nada toca em `imageSmoothingEnabled`. Hoje só a imagem de referência
liga o filtro à mão (`viewport.ts`, perto da linha 1875).

| Onde | O que |
|:---|:---|
| `runtime/src/render/canvas.ts` | `imageSmoothingEnabled = !data.pixelArt` antes de desenhar as páginas do atlas |
| `editor/src/panels/thumbnails.ts`, `mesh-panel.ts`, `io/export-image.ts` | o mesmo, lendo a marca do arquivo aberto. Na exportação vale para folha, sequência, GIF e WebM |
| Manual cap. 1 (Configurações) e cap. 7, duas línguas | uma frase: "com Arte em pixel, a cena e a exportação não suavizam" |

Teste: função pura `smoothingFor(file)` → `false` com `pixelArt: true`, `true` sem o campo. E o
exportador chamado com `pixelArt: true` grava a folha com o pixel duro: dois pixels vizinhos de
cores diferentes, escala 3×, o pixel do meio sai com uma das duas cores, não com a média.

**b) Setas nos campos numéricos.** O arrasto de lado já existe (`attachDrag`, em
`properties.ts`). Faltam `↑` e `↓`: um `step` por toque, `Shift` ×10, `Alt` ×0,1. Vale nas
Propriedades, na ficha rápida e nas caixas do tocador (velocidade, tempo, duração).

Função pura `stepValue(value, direction, step, modifiers)` em `properties-model.ts`:

| Entrada | Esperado |
|:---|:---|
| `(10, +1, 1, {})` | `11` |
| `(10, −1, 1, {shift})` | `0` |
| `(1, +1, 1, {alt})` | `1.1` |
| `(0.35, +1, 0.1, {})` | `0.45` (arredondado a 6 casas, sem `0.44999`) |

A tecla é tratada no campo e chama `stopPropagation` (regra 12): `↑` num campo não pode virar
"quadro anterior" no tocador. Um passo de desfazer por toque, **juntável** com o seguinte
(`mergeable`), como o arrasto já faz.

**c) Cabeçalho que tapa a primeira linha.** `ESTADO.md`, fim de "Acabamento": em 1440×900
o cabeçalho fixo **Animações** corta a linha "Nova · Duplicar · Renomear" quando a coluna da
direita rola. Achar o cabeçalho com `position: sticky` na coluna da direita e dar ao corpo do
painel de cima um `scroll-margin`/`padding-bottom` da altura dele, ou tirar o `sticky` do
cabeçalho quando o painel está dobrado. Conferir no navegador em 1440×900, com foto.

**d) Cap. 1 em inglês sem a tabela do menu Arquivo.** Desvio do lote 46: os dois campos das
Configurações só entraram no cap. 1 em português. Traduzir a tabela do menu Arquivo para o
`en/01-…md`, com os dois campos. O teste de completude do manual nas duas línguas tem de
continuar passando.

**Pronto quando:** as quatro linhas saem do `ESTADO.md` e o `CHANGELOG` tem as quatro.

---

### Lote 49 — avisos com nome de gente, e o botão Ir para (R11 [I]) · v8.0

Hoje o aviso diz `/skins/0/attachments/body: image "body" not found in any atlas`. É endereço de
máquina, em inglês. O Humberto lê: **pele `default` › desenho `body`: imagem "body" não está em
nenhum atlas**. E clica em **Ir para**, que escolhe o elemento na Árvore e abre o painel certo.

Os avisos nascem em `runtime/src/loader.ts` (`warn(pointer, message)`) e em
`editor/src/doc/document.ts` linha 233, que hoje cola `pointer: message`.

**Módulo puro novo** `editor/src/panels/warning-model.ts`:

| Função | Faz |
|:---|:---|
| `describePointer(file, pointer)` | ponteiro JSON → `{ text, target }`. `text` em português, com os nomes; `target` é `{ kind: 'bone' \| 'slot' \| 'attachment' \| 'animation' \| 'skin' \| 'constraint' \| 'skeleton', name, skin?, slot? }` ou `null` quando não há o que escolher |
| `translateWarning(message)` | as frases do loader que têm forma fixa viram português: `image "X" not found in any atlas` → `imagem "X" não está em nenhum atlas`; `unknown value "X", using "Y"` → `valor "X" desconhecido; usando "Y"`; `file version X newer than reader Y: partial read` → `arquivo na versão X, leitor na Y: leitura parcial`. O que não bater fica como está |
| `fixFor(warning)` | só quando há conserto automático: imagem não encontrada → `{ label: 'Trocar imagem…', action: 'swap-image' }`; valor desconhecido → `{ label: 'Gravar o padrão', action: 'write-fallback' }`. Senão `null` |

| Teste | Esperado |
|:---|:---|
| `describePointer(heroi, '/skins/0/attachments/body')` | `text` = `pele "default" › desenho "body"`; `target` = `{ kind: 'attachment', skin: 'default', slot: 'body', name: 'body' }` |
| `describePointer(heroi, '/bones/3/rotation')` | `osso "<nome do 4º osso>" › rotation`; `target.kind` = `bone` |
| `describePointer(heroi, '/animations/1/timelines/0')` | `animação "walk" › linha 1`; `target` = animação `walk` |
| `describePointer(heroi, '/skeleton/version')` | `cabeçalho › version`; `target` = `{ kind: 'skeleton' }` |
| ponteiro que não existe no arquivo | `text` = o ponteiro cru; `target` = `null` |
| `translateWarning('image "body" not found in any atlas')` | `imagem "body" não está em nenhum atlas` |
| `fixFor` do aviso acima | `{ label: 'Trocar imagem…', action: 'swap-image' }` |

**Tela** (`ui/shell.ts`, a lista `warnList`): cada linha ganha o texto traduzido, o botão
**Ir para** (ícone de mira, nome na dica) quando há `target`, e o botão do conserto quando há
`fixFor`. **Ir para** faz `selection.select(target)` e abre a aba do painel dono (Árvore para
osso e slot; Imagens para desenho; Animações para animação; Peles para pele; Regras para
regra). `Trocar imagem…` abre a mesma janela que a aba Imagens usa. `Gravar o padrão` é um
`Command` com `apply`/`revert` exatos que escreve o `fallback` no ponteiro.

Manual: cap. 1 (a barra de avisos) e cap. 8 (problemas), duas línguas.

**Pronto quando:** abrir um `.bone` com imagem faltando mostra o aviso em português, com nome,
e **Ir para** escolhe o desenho. R11 sai da lista do `ESTADO.md`.

---

### Lote 50 — arrastar para entre duas linhas na aba Ordem · v8.1

Hoje soltar em cima de uma linha **troca de lugar** com ela (`wireDrop` em `draw-order.ts`,
`MoveSlot(from, to)`). No Spine e no Spriter, soltar entre duas linhas **insere** ali. Os dois
gestos passam a existir: o terço de cima e o de baixo da linha inserem antes e depois; o terço
do meio faz o que faz hoje.

Função pura em `draw-order-model.ts`:

| Função | Esperado |
|:---|:---|
| `dropZone(offsetY, rowHeight)` | `(3, 30)` → `'antes'`; `(15, 30)` → `'em-cima'`; `(27, 30)` → `'depois'` |
| `insertIndex(from, targetIndex, zone, total)` | de 5 para a linha 2 `'antes'` → `2`; de 5 para 2 `'depois'` → `3`; de 1 para 4 `'antes'` → `3` (o próprio sai de trás); de 1 para 4 `'depois'` → `4`; alvo igual à origem → `null` |
| pasta inteira (`MoveFolder`) | a mesma conta, com `count`; um bloco de 3 saindo do 1 para antes do 6 → `to = 3` |

Tela: uma linha fina laranja entre as duas linhas enquanto arrasta (`ordem-alvo-antes`,
`ordem-alvo-depois`); o realce de hoje continua no terço do meio. A Árvore **não** muda neste
lote: lá soltar em cima é trocar de pai, gesto diferente.

Manual cap. 3 (a aba Ordem), duas línguas, com a frase dos três terços.

**Pronto quando:** dá para levar `hair` para entre `cape_upper` e `cape_lower` num arrasto, e o
desfazer devolve numa vez.

---

### Lote 51 — sequência de PNG num `.zip` só · v8.2

A sequência baixa um arquivo por quadro e o navegador pede permissão. O editor já grava ZIP
(`browserCodec` e `packageBytes` em `io/save-binary.ts`, usados pelo `.bonez`). A janela
**Exportar imagem** ganha, só com **Sequência de PNG** escolhida, a caixa **Um arquivo só
(.zip)**, ligada por padrão.

| Onde | O que |
|:---|:---|
| `io/export-image.ts` | `zipPlan(files)` pura: nomes dentro do zip, `heroi/heroi_0001.png…`, e o `heroi.zip` na saída. A gravação usa o codec que o `.bonez` usa |
| Janela | a caixa; `Ctrl+Shift+E` repete a escolha |
| Manual cap. 7, duas línguas | a caixa, e a linha "pede permissão" sai de "O que ainda não funciona" |

| Teste | Esperado |
|:---|:---|
| `zipPlan([heroi_0001.png … heroi_0012.png])` | um só arquivo `heroi.zip`, com 12 entradas na pasta `heroi/`, na ordem |
| ZIP gravado e lido de volta pelo leitor do `.bonez` | 12 entradas, bytes iguais aos PNG soltos |
| caixa desligada | 12 downloads, como hoje |

**Pronto quando:** exportar `idle` como sequência baixa um único arquivo e nenhuma permissão é pedida.

---

### Lote 52 — altura dos painéis da direita arrastável · v8.3

Hoje dá para dobrar um painel, não para medir. Entre dois painéis abertos da coluna da direita
(`.panel-column-direita`) nasce um divisor de 6 px; arrastar tira de um e dá ao outro, com
mínimo de 80 px. Dois cliques no divisor devolvem o padrão. As alturas ficam no navegador
(`localStorage`), como o tema: são da máquina, não do arquivo nem do `RECORTE_editor_state`.

Função pura em `panels/dock-model.ts` (ou arquivo novo `column-model.ts`):

| Função | Esperado |
|:---|:---|
| `resizePlan(heights, index, dy, min)` | `([200, 200, 200], 0, +50, 80)` → `[250, 150, 200]`; `([200, 100, 200], 0, +50, 80)` → `[220, 80, 200]` (bate no mínimo); `dy` negativo simétrico; painel dobrado é pulado |
| `defaultHeights(count, total)` | divide igual, inteiros, soma igual a `total` |

Tela: o divisor tem `cursor: row-resize` e nome na dica ("Puxe para mudar a altura"). Tecla
tratada uma vez. Com um painel dobrado o divisor dele some.

Manual cap. 1 (a tela), duas línguas.

**Pronto quando:** dá para dar 60% da coluna à Árvore e o valor sobrevive ao recarregar.

---

### Lote 53 — o confronto contra uma pasta vira comando · v8.4

`ESTADO.md`: "é a linha que mais rende de todas". Os cinco defeitos da fase 8 saíram daqui.
Hoje `comparar-runtimes.mjs` só varre `conformidade/casos` (const `CASOS`, linha 26).

| Onde | O que |
|:---|:---|
| `ferramentas/comparar-runtimes.mjs` | opção `--pasta <dir>`: cada `.bone` e `.bonez` da pasta (e subpastas) vira um "caso" com a **sonda padrão**; `--sonda <arquivo.json>` troca a sonda |
| sonda padrão, função pura `sondaPadrao(file)` em `ferramentas/src/sonda-padrao.ts` | toda animação × toda pele × laço ligado e desligado, 8 amostras por animação (0, 1/7 … 7/7 da duração), os canais todos do dump |
| `package.json` | `npm run confronto -- --pasta formato/exemplos` |
| `conformidade/dois-runtimes.md` | seção "Como rodar contra uma pasta" |

| Teste | Esperado |
|:---|:---|
| `sondaPadrao(heroi)` | 3 animações × 3 peles × 2 = 18 combinações, 8 amostras cada; tempos da `walk` = `0, 1/7, …, 1` |
| `--pasta formato/exemplos` | os 9 exemplos, **zero divergência** nos dois runtimes (se houver, é defeito real: parar, abrir caso de conformidade, corrigir, anotar em Desvios) |
| `--pasta` numa pasta vazia | sai com aviso e código 0; arquivo inválido é listado e pulado |

**Pronto quando:** `npm run confronto -- --pasta formato/exemplos` roda e o `ESTADO.md` diz que o confronto contra arquivos reais é rotina.

---

### Lote 54 — cobertura da suíte · v8.5

`ESTADO.md`, "O que a suíte ainda NÃO cobre". A §12.4 exige fechar antes da 1.0. Nenhum caso
abaixo precisa de decisão. Esperado: os dois runtimes concordando **e** pelo menos um valor
conferido à mão, escrito no `leiame.md`.

| Caso | Prende |
|:---|:---|
| A-032 `tag` | canal `tags` do dump; tag ligada e desligada por chave |
| A-033 `variable` | canal `variables`; número, texto e booleano |
| A-034 `parameter` | canal `parameters` medido de frente, não de raspão |
| A-035 `driver` | a saída do driver numa propriedade de osso |
| B-107 `skeleton` aninhado | filho com o prefixo `<slot>/` nos canais (o que já vale sem socket) |
| B-108 `darkColor` e `blend` | os dois campos no canal de slot |
| ZIP-502 `.bonez` com `main` em **subpasta** | "pasta do `main`" ≠ "raiz do ZIP" (§2.8) |
| C-232, C-233 | o rig de shear do C-230 sob **caminho** e sob **física** |
| C-213 | C-212 com `softness ≠ 0` |
| C-221 | C-220 com `offsetShearY ≠ 0` e alvo de determinante negativo |
| C-263 | física com `mix` indo a 0 e voltando (§5.6) |

**Ficam de fora, e vão para Desvios:** caminho com escala ≠ 1 nos três `spacingMode`
(dúvidas 19 e 20) e `deform` sobre `boundingbox` (dúvida 4). A spec se contradiz nos dois; é
decisão do Humberto.

Se um caso reprovar num runtime, é defeito: corrigir, anotar, contagem de casos e testes sobe.
`README.md` e `conformidade/README.md` com a contagem nova.

**Pronto quando:** a lista "Continuam sem caso nenhum" do `ESTADO.md` fica vazia, menos as duas linhas de decisão.

---

## 2. Ordem de trabalho

1. Ler `CLAUDE.md`, `editor/src/contract.ts` inteiro, este plano.
2. Um lote por versão, **48 → 54**. Backup antes, com o motivo no nome. Linha no `INDICE.md`.
3. Fecho de cada lote: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · manual nas duas línguas · `CHANGELOG` · `python ferramentas/versao.py N.N "o que mudou"`.
4. A contagem de testes não cai de **2.294**.
5. Botão novo nasce em ícone, com o nome na dica. Tecla tratada uma vez.
6. Item que não bater com o código: parar, escrever em **Desvios**, seguir. Precisou de campo no formato ou no atlas: **não faz**; anota e segue.
7. Nada de perguntar ao Humberto sobre socket, repositório, licença, domínio, pivô ou ponto animado. Está tudo anotado.
8. No fim de cada lote, avisar em três linhas: versão, o que entrou, testes.
9. Depois do lote 52, atualizar o `ESTADO.md`: a seção "Acabamento" perde as linhas feitas e a contagem do topo muda.

## 3. O que este plano NÃO toca

| O que | Por quê | Onde está anotado |
|:---|:---|:---|
| Pivô por imagem no atlas (lote A da pesquisa) | campo novo no atlas: decisão dele (regra 7) | `pesquisa/nova pesquisa/Pivot em skins…`, §8 e §10 |
| "Troca esperta" e "PSD como pele" (degraus 1 e 2 do pivô) | sem campo novo, **mas** ele disse "está envolvido com o pivô, ignora por enquanto" | `PENDENCIAS`, item 15 |
| Ponto animado (D4) | idem | `PENDENCIAS`, item 15 |
| Runtime do socket | "programa primeiro" | `PENDENCIAS`, item 9 |
| Interface em inglês | grande; não é [M]; ele não pediu | `ESTADO.md`, seção D |
| Régua em ms, Alt+arrastar, atalhos remapeáveis, contorno laranja | "sem urgência", dele | `PENDENCIAS`, itens 5 a 8 |

## Desvios

(o executor escreve aqui)

### Ordem do Humberto, 10/09/2026, depois do lote 48 — "primeiro o bolo, depois o glacê"

| O que muda neste plano | Por quê |
|:---|:---|
| **Os lotes 53 e 54 saem da rodada.** Foram para a lista do glacê, itens 20 e 21 da `PENDENCIAS 2026-09-09.md` | cuidam do formato e dos leitores, não do editor. O programa ainda não está pronto |
| **Nenhum lote escreve no manual.** As linhas "Manual cap. …" dos lotes 49 a 52 não se fazem | manual pausado até ele pedir. Os testes que leem o manual estão pulados (`editor/testes/manual-pausado.ts`) |
| A rodada fecha no **lote 52**, com o `ESTADO.md` e o `programa/` montado de novo | — |

### Onde parou (10/09/2026, noite) — para o próximo chat executor

**O lote 49 NÃO começou.** Nenhum código escrito. A cópia
`backup/editor-src_2026-09-10_antes-do-lote-49/` já existe e serve de linha de
base. Ponto de partida: **v7.9**, 2.286 passando + 29 pulados (manual) = 2.315, 53/53.

O que já foi descoberto para o lote 49:

| Coisa | Como é |
|:---|:---|
| Aviso no documento | `doc.warnings` é `string[]`, montado em `doc/document.ts` (`rebuildQuiet`) como `` `${pointer}: ${message}` ``. Dá para ler de volta sem mudar o contrato |
| Imagem faltando, de verdade | ponteiro `/skins/0/attachments/body/body/path`, mensagem `image "nao-existe" not found in any atlas; attachment will be invisible` (medido no leitor) |
| Formato das peles | `skins[i].attachments[slot][desenho]` |
| Herói | 4º osso = `head`; animações `idle, walk, attack`; peles `default, armadura, armadura_capa`; slot `body` mostra `body` |
| Lista na tela | `ui/shell.ts`, perto da linha 1440: `this.warnList.replaceChildren(...)`, com o `el(tag, atributos, filhos)` do próprio `shell.ts` |
| Abrir painel | `this.showPanel(id)`; ids em `WINDOW_PANELS` (`ui/menus.ts`) |
| Trocar imagem | `this.swapImageEverywhere()` usa `selection.attachments[0]`: escolher o desenho e chamar |
| Gravar o padrão | `SetProperty(pointer, valor, label)` de `panels/properties-model.ts` |
| Ícones | `SHAPES` em `ui/icons.ts`; existe `image`, não existe mira nem `check` |
| Sem atlas no `Doc` de teste | o leitor não confere imagem; para o teste de ponta a ponta, `loadSkeletonData` com o atlas |

### Lote 49 — v8.5

Feito depois do plano pivô (lotes 55 a 58, v8.0 a v8.4), como ele mandava.
Ponto de partida: v8.4, 2.382 testes.

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | v8.0 | os números até a v8.4 foram do plano pivô e do conserto de outro chat | lote 49 = **v8.5** |
| 2 | manual caps. 1 e 8 | manual pausado (ordem do Humberto) | não feito |
| 3 | botões `Trocar imagem…` e `Gravar o padrão` | regra: botão novo nasce em ícone, com o nome na dica | ícones (imagem, disquete), com a frase inteira na dica |
| 4 | `describePointer('/skins/0/attachments/body')` dá o desenho `body` | o ponteiro para no slot, sem o nome do desenho | sem o nome no ponteiro, vale o primeiro desenho do slot naquela pele |
| 5 | Ir para de animação | abrir uma animação é trocar de modo | `doc.animation = nome`, o mesmo caminho da aba Animações, e abre a aba |
| 6 | conferir na tela com um `.bone` de imagem faltando | abrir esse arquivo pela janela exigiria mexer no rascunho do herói do Humberto | conferido nos testes, com o aviso de verdade que o leitor dá (`loadSkeletonData` com o atlas); não na tela |

### Lote 52 — v8.8

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | v8.3 | número já usado | lote 52 = **v8.8** |
| 2 | manual cap. 1 | manual pausado | não feito |
| 3 | "nasce um divisor de 6 px" entre painéis; `resizePlan(heights, index, dy, min)` para N painéis | desde o item 19 cada coluna é de **dois grupos de abas**, e a alça entre eles (8 px, `row-resize`, setas) já existia | nada de N painéis: a alça que existe ganhou o mínimo de 80 px (`resizeSplit`), os dois cliques, e a gravação no navegador. `defaultHeights` virou `defaultSplit(lado)` |
| 4 | alturas no `localStorage`, "não do arquivo" | a divisão já era gravada no `RECORTE_editor_state` | vai para os dois; ao abrir, a do navegador ganha. Tirar do arquivo mudaria o texto de todo arquivo já gravado |
| 5 | tecla tratada uma vez | as setas da alça não paravam o evento | `stopPropagation` |
| 6 | "com um painel dobrado o divisor dele some" | a coluna de abas não tem painel dobrado | não se aplica |
| 7 | pronto quando: 60% para a Árvore sobrevive a recarregar | — | conferido na tela, com os eventos disparados no próprio controle (o painel do navegador estava escondido); números no relatório ao Humberto |

**A rodada 5 fecha aqui** (lotes 48 a 52). Os lotes 53 e 54 foram para o glacê, por ordem do Humberto.

### Lote 51 — v8.7

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | v8.2 | número já usado | lote 51 = **v8.7** |
| 2 | manual cap. 7 | manual pausado | não feito; a linha "pede permissão" continua no manual até ele voltar |
| 3 | "a gravação usa o codec que o `.bonez` usa" | o único gravador de ZIP era o `writeBonez`, que sempre põe `mimetype` e `manifest.json`, e o leitor do `.bonez` recusa ZIP sem eles | o fim do ZIP virou `finishZip`, e nasceu `writeZip` (ZIP comum) no mesmo arquivo do runtime. O `.bonez` sai byte a byte igual; ZIP-501 passa |
| 4 | "ZIP lido de volta pelo leitor do `.bonez`" | o leitor do `.bonez` exige o `mimetype` | o teste lê o ZIP pelos cabeçalhos locais e confere nomes, ordem e bytes; um segundo teste prova que o `.bonez` continua sendo lido |
| 5 | codec do navegador | PNG já vem comprimido, e o gravador guarda PNG sem comprimir de novo | o `.zip` sai guardado, sem o compressor do navegador: mais simples e mais rápido |
| 6 | conferir na tela | a automação não baixa arquivo com o painel do navegador escondido | conferido nos testes |

### Lote 50 — v8.6

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | v8.1 | número já usado | lote 50 = **v8.6** |
| 2 | manual cap. 3 | manual pausado | não feito |
| 3 | `insertIndex(…, 'antes' \| 'depois', …)` | a aba Ordem é de ponta-cabeça (lote 25): acima na tela é na frente, que no arquivo é depois | a conta é em índice do arquivo; `arrayZone` converte o terço da tela. Teste prende |
| 4 | pasta com a mesma conta | a cabeça da pasta representa o bloco inteiro | a cabeça fica só com o terço do meio, o de sempre; uma pasta arrastada para cima de uma **linha de peça** usa os três terços, com `count` |
| 5 | conferir na tela | a automação não arrasta com o painel do navegador escondido | conferido nos testes, com o `MoveSlot` no herói (`hair` entre `cape_upper` e `cape_lower`) e o `MoveFolder` |

### Lote 49 — v8.5

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | `smoothingFor(file)` | a marca mora em `file.skeleton.pixelArt` e em `SkeletonData.meta.pixelArt`; o renderizador só tem o `Skeleton` | `smoothingFor(meta)` no runtime (`render/canvas.ts`), recebe o `skeleton` do arquivo ou o `meta` do runtime. O `draw` chama sozinho: cena, Prévia, miniatura do esqueleto filho e exportação herdam sem uma linha nova |
| 2 | teste do "pixel duro" no exportador | não há canvas no vitest (regra 8) | dois testes: no vitest, um contexto falso anota o filtro em cada `drawImage` da página (com e sem tinta); **no navegador**, o mesmo renderizador ampliando 2 px (vermelho, azul) 3×: com a marca o meio sai `255,0,0` · `0,0,255`; sem, `170,0,85` · `85,0,170` |
| 3 | manual cap. 1 (Configurações) | a caixa **Arte em pixel** não fica nas Configurações: fica em Propriedades → Esqueleto, com nada escolhido | a frase foi para o cap. 7 (seção nova "Arte em pixel"), nas duas línguas; a linha R9 saiu do "O que ainda não funciona" do cap. 2 |
| 4 | desfazer: "um passo por toque, juntável com o seguinte" | as duas metades se contradizem | segurar a seta = **um** passo (a repetição da tecla junta); soltar a tecla fecha o passo (`endMerge` no `keyup`), então três toques = três passos. Na duração, cada toque é um passo (`EditKeys` não junta) |
| 5 | c) achar o `sticky` da coluna da direita | **não há** `sticky` nenhum na coluna: o defeito era do layout empilhado da fase 8 e sumiu com as abas (item 19) | nada mudou no CSS. Conferido em 1440×900 por teste de clique: os cinco botões de Animações respondem no topo e no fim do rolo. Dois testes prendem: nenhuma folha de painel usa `sticky` fora da linha do tempo e da janela, e `.panel-column` tem `overflow: hidden` |
| 6 | — | achado ao conferir o c): a lista de **Animações** tem só **72 px** de altura em 1440×900 (duas linhas) | é o assunto do lote 52 (altura dos painéis). Não mexido aqui |
| 7 | d) só a tabela do Arquivo | o cap. 1 em português não listava **PSD com ossos…** (lote 45) | a linha entrou nas duas línguas; "Exportar → Imagem…" passou a dizer WebM |
| 8 | — | as páginas do atlas têm `minFilter`/`magFilter` (`heroi.atlas.json`: `linear`) e o renderizador não lê | fora do escopo: a marca do esqueleto manda. Ler o filtro da página seria outro lote, e o `site/validador` e o `visualizador` usam o renderizador montado à parte, sem esta mudança |
