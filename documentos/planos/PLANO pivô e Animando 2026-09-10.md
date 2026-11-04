# PLANO pivô no atlas e Animando livre · 10/09/2026

Planejador → executor. Quatro lotes, **só bolo**. Entra **na frente** do resto da rodada 5: o executor termina o lote que estiver fazendo, faz estes quatro, depois volta aos que faltarem de 49 a 52.

**Regra do dia (Humberto, 10/09, depois da v7.9): "primeiro o bolo, depois o glacê".** Bolo = o editor funcionando. Glacê = manual, runtime em Python, suíte de conformidade, confronto, site, troca de nome. Este plano não tem glacê. O que sobrou de glacê está anotado no fim, para não se perder.

## Contexto

**O problema.** Mão fechada e mão aberta são desenhos diferentes, com pivôs em cantos diferentes, e as duas têm que cair no mesmo pulso. Hoje a troca de imagem (`SwapSlotImage`, `SwapImageEverywhere`) escreve só o `path`: `x/y` ficam os da imagem velha e, se `width/height` estão gravados, a §7.3 **estica** a nova para o tamanho da velha. É o "pop".

**Como os outros fazem.** Spine guarda o deslocamento no anexo; Spriter guarda o pivô na imagem. Os dois exigem acerto à mão, imagem por imagem.

**A decisão do Humberto, 10/09/2026 (fecha a D5 da rodada 4 e a pendência 15):**

| # | Decidido |
|:---:|:---|
| 1 | **Pivô por região do atlas**: `pivotX`, `pivotY` na §10.3. Campo novo no atlas, autorizado por ele (regra 7) |
| 2 | **O rig é a fonte da verdade.** O editor calcula o pivô a partir do personagem montado e o atlas sai carimbado. Ninguém marca pivô à mão para o que já está montado |
| 3 | **Um pivô por imagem.** Imagem usada em dois ossos ganha um só; quem quiser dois, **duplica no atlas** |
| 4 | O `.bone` **não muda** e o runtime **não muda de conta**: o anexo continua com `x/y`. O pivô é para ferramenta e editor |
| 5 | Extra: **criar e remover osso, e trazer imagem, no modo Animando**, como o Spriter. Conforto de editor, zero formato |

**Ponto de partida:** v7.9 (lote 48) ou a que o executor tiver gravado; a contagem de testes de então, sem cair.

## A conta, uma vez só

Anexo `region` tem `x, y, rotation, scaleX, scaleY` e, opcionalmente, `width W, height H`. A região tem `originalWidth ow, originalHeight oh`. A origem do osso, vista de dentro da imagem, em px da imagem original, da esquerda e de baixo (a mesma origem de `offsetX/offsetY`):

```
kx = W/ow (1 se W ausente)      ky = H/oh (1 se H ausente)
(u, v) = R(−rotation) · (−x, −y)          R(θ)(a,b) = (a·cosθ − b·sinθ, a·sinθ + b·cosθ)
pivotX = ow/2 + u / (scaleX·kx)           pivotY = oh/2 + v / (scaleY·ky)
```

A volta, para colocar uma imagem nova pelo pivô dela (sem `width/height`, `k = 1`):

```
(x, y) = −R(rotation) · (scaleX·(pivotX − ow/2), scaleY·(pivotY − oh/2))
```

| Entrada | Esperado |
|:---|:---|
| `x 10, y −20`, sem giro, `ow 100, oh 50` | pivô `(40, 45)` |
| o mesmo com `rotation 90` | pivô `(70, 35)` |
| o mesmo com `W 200, H 100` (imagem esticada 2×) | pivô `(45, 35)` |
| volta de `(40, 45)`, `ow 100, oh 50`, sem giro | `x 10, y −20` |
| ida e volta em qualquer anexo do `heroi.bone` | fecha em 1e-9 |

O pivô **pode cair fora da imagem** (cabo de espada fora do desenho). Sem limite de faixa. Ausente = centro, que é o que todo arquivo de hoje já supõe.

---

## Lote 55 — o campo no formato · próxima versão livre

Só o formato e o que o editor usa para lê-lo. Nenhuma conta de pose muda. **Sem Python, sem caso de conformidade, sem manual: glacê.**

| Onde | O que |
|:---|:---|
| `formato/ESPECIFICACAO 2026-09-06.md` §10.3 (linhas 2472–2489) | duas linhas na tabela de `Region`: `pivotX`, `pivotY`, number, opcional, padrão `originalWidth/2` e `originalHeight/2`. Texto: "px da imagem **original**, da esquerda e de baixo, como `offsetX/offsetY`. Sobrevive ao corte e ao reempacotar. **Informativo para quem calcula pose**: o runtime não usa; o anexo já traz `x/y`. Editores e ferramentas usam para colocar uma imagem nova no lugar: a fórmula acima, dos dois lados." Apêndice A **71** |
| `formato/bone.schema.json` `atlasRegion` (1054–1075) | `pivotX`, `pivotY`: `{ "type": "number" }` |
| `runtime/src/types.ts` 622–635, `data.ts` 1062–1118, `loader.ts` 2181–2222 | o campo entra em `AtlasRegion` e `AtlasRegionData`, lido com `optNumber`. **`region.ts` não muda**: a pose é a mesma com ou sem pivô |
| `ferramentas/src/atlas/packer.ts` `PackerItem` (70–76), `Prepared` (484–495), saída (799–803) | `pivotX/pivotY` passam de entrada a saída sem conta: o pivô é da imagem original, e o corte não o move |
| `ferramentas/src/exportar/fatiar.ts` `repackAtlas` (976–1010) | preserva `pivotX/pivotY` como já preserva `aliases` |
| `editor/src/io/save-binary.ts` `atlasToJson` (269–297) | grava os dois quando presentes |
| `ferramentas/validador/validar.mjs` `checarAtlas` e `site/validador/nucleo.js` (cópia à mão) | aceitam number; nada de faixa. Rodar `node site/validador/construir-esquema.mjs` |
| `formato/exemplos/heroi.atlas.json` | **não** carimbar aqui: o lote 56 carimba pelo editor e o exemplo é regravado lá |
| `CHANGELOG.md` | a entrada |

| Teste | Esperado |
|:---|:---|
| `packAtlas` com um item `pivotX 12, pivotY 3` e borda transparente cortada | região de saída com `offsetX > 0` e `pivotX 12, pivotY 3` intactos |
| `repackAtlas` de uma pele | as regiões mantidas trazem o pivô da origem |
| `atlasToJson` → `loadAtlas` | ida e volta dos dois campos; sem pivô no original, nada é gravado |
| `loadAtlas` de um atlas com pivô e a pose do `heroi` | pose **idêntica**, por texto, à do atlas sem pivô (teste em `runtime/testes/loader.test.ts`) |

**Pronto quando:** um atlas com pivô passa no validador e no runtime TypeScript, e a pose não muda.

---

## Lote 56 — o editor carimba, e a troca de imagem cai no lugar · próxima versão livre

**Módulo puro novo** `editor/src/io/pivot-model.ts`:

| Função | Faz |
|:---|:---|
| `pivotOf(attachment, region)` | a ida, tabela acima |
| `placeByPivot(region, attachment)` | a volta: devolve `{ x, y }` novos, sem `width/height` |
| `stampPivots(file, atlases)` | para cada região: junta todos os anexos `region` que a usam, em todas as peles. **Um anexo, ou todos concordando em até 0,5 px** → grava o pivô. **Dois ou mais discordando** → não toca no pivô e devolve o aviso `imagem "X" é usada em N lugares com pivôs diferentes; duplique no atlas`. Devolve `{ atlases, warnings, stamped }` |
| `duplicateRegion(atlas, name)` | copia a região para `name_2` (mesma página, mesmo retângulo, sem `aliases`), para um anexo apontar para ela |

| Teste | Esperado |
|:---|:---|
| `stampPivots(heroi)` | toda região usada por um anexo só ganha pivô; `warnings` vazio; `stamped` = número de regiões |
| dois anexos na mesma região, mesmo `x/y` | carimba, sem aviso |
| dois anexos, `x` diferindo em 3 px | não carimba, um aviso com o nome da imagem e `N = 2` |
| `duplicateRegion` | região nova `mao_2`, `x/y/width/height/page` iguais, nome único mesmo se `mao_2` já existir (`mao_3`) |

**Onde o carimbo acontece**

| Quando | Como |
|:---|:---|
| **Salvar** e **exportar** (`.bone` + atlas, `.bonez`, pacote por pele) | `packageBytes` e `atlasToJson` passam por `stampPivots` antes de gravar. O atlas em disco é derivado do rig: sem passo de desfazer. O texto original do atlas importado (linhas 215–220 de `save-binary.ts`) só é reaproveitado se o carimbo não mudou nada |
| Botão **Carimbar pivôs** na aba Imagens, ícone com nome na dica | roda na hora como `Command` no padrão do `ImportImagesCommand` (snapshot de `assets` + `setAssets`), para o painel mostrar já. Os avisos vão para a barra de avisos |
| Miniaturas da aba Imagens (`thumbnails.ts`) | uma cruz pequena no pivô, quando há |

**Onde o pivô é usado**

| Gesto | Hoje | Passa a |
|:---|:---|:---|
| Trocar a imagem de um slot (`SwapSlotImage`, `palette-model.ts` 200–232) | só `path` | `path`; se a região nova tem pivô: `x/y` por `placeByPivot`, **apaga `width/height`**; `rotation/scale` ficam. Sem pivô: `x/y` ficam, `width/height` apagados (a nova sai no tamanho dela, sem esticar). Um `Command`, `revert` exato dos cinco campos |
| Trocar em todas as peles (`SwapImageEverywhere`, `skins-model.ts` 459–502) | só `path` | o mesmo, anexo a anexo |
| Arrastar imagem da aba Imagens para cima de um **slot da Árvore** ou de um **placeholder vazio na aba Peles** | não existe: `onDrop` da cena sempre cria slot novo | cria o anexo naquele slot, na pele em edição (`AddAttachmentToSlot`, `tree-model.ts` 579–630), `x/y` por `placeByPivot` quando há pivô; sem pivô, no centro do osso |
| **Duplicar no atlas** (menu do botão direito na aba Imagens, e o botão do aviso) | não existe | `duplicateRegion` + o anexo escolhido passa a apontar para a cópia. Um `Command`. Depois disso cada cópia carimba sozinha |
| Malha (`mesh`, `linkedmesh`) | só `path` | **fica como está.** Malha tem vértices e UV; a troca por pivô é de `region`. Anotar no manual |

Depois do lote: abrir `heroi.bone`, **Carimbar**, salvar; `formato/exemplos/heroi.atlas.json` regravado com pivôs (backup antes, linha no `INDICE.md`); `conferir-arte` e os testes que leem o exemplo continuam passando.

Manual: **pausado**. A regra de arte (*desenhe cada variação no quadro da original, com a articulação no mesmo pixel*) entra como a **dica** do botão Carimbar, para não se perder.

**Pronto quando:** no herói, trocar `mao_aberta` por `mao_fechada` (tamanhos diferentes) deixa o pulso parado, sem esticar, e desfazer devolve tudo.

---

## Lote 57 — criar e remover osso, e trazer imagem, em Animando · próxima versão livre

**O que há hoje.** `Tool.modes = ['montagem']` em `create-bone.ts` 302, `point-tool.ts` 145, `box-tool.ts` 51 (e `mesh-tool.ts` 77, `weights-tool.ts` 103) faz a ferramenta **sumir** da barra em Animando (contrato 262–270). Importar imagens e apagar pela Árvore **já não têm trava**. O formato já suporta tudo: osso sem timeline usa a setup pose (§9.10), slot nasce vazio e ganha imagem por chave `attachment` (§9.1, §9.5).

| O que | Passa a |
|:---|:---|
| **Criar osso**, **Ponto**, **Caixa** | `modes` some das três: valem nos dois modos. **Malha e Pesos ficam em Montagem** (mexem em vértice, não têm gesto de animação). O texto do contrato 262–270 muda junto |
| Osso criado em Animando | entra na **Montagem** (`AddBone`, estrutura), medido contra a pose **animada** do pai naquele instante: o osso nasce onde foi desenhado, na animação aberta. Rodapé: *Osso novo entra na Montagem e vale em todas as animações*. Sem chave: em `t` ele está onde foi desenhado; na Montagem, na mesma posição relativa ao pai |
| **Imagem solta na cena em Animando** (`DropImageAsSlot`) com **Gravar sozinho ligado** | o slot nasce com `attachment` de setup **vazio**; a pele ganha o anexo; a animação ganha a chave `slot/attachment = nome` em `t` e, se `t > 0`, uma chave `null` em `0`. É o objeto que "aparece" no meio da animação, como no Spriter. Rodapé: *"mao" entra nesta animação a partir de 0,40 s. Montagem e as outras animações ficam sem ela* |
| A mesma imagem com **Gravar sozinho desligado** | como hoje: anexo na setup, aparece em tudo |
| **Apagar osso ou slot animado** (`DeleteItems`, `tree-model.ts` 916–971) | passa a **podar as timelines** que apontam para o que saiu, nos dois modos, reaproveitando `pruneTimelines` de `doc/commands.ts` 182–187 (código que existe e ninguém chama). `revert` continua pelo snapshot. **É defeito hoje**: apagar um osso animado deixa timeline órfã |
| **Remover imagem no meio da animação** | já existe: o campo Desenho em Animando grava a chave `null` (teste `lote3a`). Só ganha a frase no manual |
| Alt+arrastar do Spriter | **não**: `Alt` já é de Ponto, Caixa, Selecionar, Pose, Inclinar. As teclas `N`, e as de Ponto e Caixa, passam a valer em Animando |

Funções puras, com teste:

| Função | Esperado |
|:---|:---|
| `appearKeys(t)` em `palette-model.ts` | `t = 0` → `[{0, nome}]`; `t = 0.4` → `[{0, null}, {0.4, nome}]` |
| `DropImageAsSlot` em Animando, autoKey ligado, `t = 0.4`, `walk` | `slots[n].attachment` ausente; `skins[edição].attachments[slot][nome]` existe; `walk` tem a timeline `slot/attachment` com as duas chaves; `idle` não muda; `revert` apaga as três coisas |
| `DeleteItems` num osso com timeline em `walk` | a timeline some de `walk`; `revert` devolve por texto |
| `toolForKey('N', 'animando')` (`viewport.ts` 268) | devolve Criar osso; `toolWrongMode` continua para Malha e Pesos |
| Criar osso em Animando com o pai girado 90° pela animação | o osso local tem `rotation` medida contra o pai animado; a Montagem recebe o mesmo valor local |

Testes que **mudam de expectativa**, não de contagem: `lote33-o-basico.test.ts` linha 48 ("N … NADA em Animando" vira "N escolhe Criar osso nos dois modos"), `lote26` (ícones por modo), `lote38`.

Manual pausado. `CHANGELOG`.

**Pronto quando:** com `walk` aberta em 0,4 s, dá para criar um osso, soltar uma espada nele e ela aparece só dali em diante; voltar à Montagem mostra o osso e nenhuma espada.

---

## Lote 58 — pivô à mão, para imagem que ainda não tem rig · próxima versão livre

Para a imagem solta, desenhada fora do quadro (porta 4 da pesquisa). Pequeno.

| O que | Como |
|:---|:---|
| **Definir pivô…** na aba Imagens (botão direito e botão com ícone) | janela com a imagem, **9 pontos** (cantos, meios, centro) e **clique** na articulação. Grava `pivotX/pivotY` na região, `Command` com `revert` |
| Se a região já é usada por anexos | a janela avisa: *N desenhos usam esta imagem e serão recolocados pelo pivô novo* — e recoloca (`placeByPivot`), no mesmo `Command`. O rig continua sendo a verdade: carimbar de novo dá o mesmo número |
| **Copiar pivô / Colar pivô** entre imagens escolhidas | o mesmo padrão do `anchor-clipboard.ts`; em px da imagem original, então colar entre tamanhos diferentes copia a **proporção** (0..1), como o Spriter |

| Teste | Esperado |
|:---|:---|
| `ninePoint('nw', ow 100, oh 50)` | `(0, 50)`; `'c'` → `(50, 25)`; `'se'` → `(100, 0)` |
| clique em `(30, 10)` da imagem de tela 200×100 mostrando `ow 100, oh 50` | pivô `(15, 45)` (y de baixo) |
| colar de `ow 100` para `ow 200`, pivô `(40, 45)` em `(100, 50)` | `(80, 90)` |
| definir pivô numa região usada por 2 anexos | os dois com `x/y` novos; `revert` devolve os dois e o pivô |

Manual pausado. `CHANGELOG`.

---

## Ordem de trabalho

1. Terminar o lote que estiver aberto. Depois **55 → 56 → 57 → 58**. Depois voltar ao que faltar de 49–52.
2. Backup antes, com o motivo no nome; linha no `INDICE.md`. O lote 55 mexe em `formato/`: é a segunda exceção autorizada à regra "executor não toca `formato/`", pela decisão do Humberto de hoje.
3. Fecho de cada lote: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (os 53 de hoje não podem quebrar) · `CHANGELOG` · `python ferramentas/versao.py N.N "…"`.
4. Contagem de testes não cai. Botão novo em ícone com nome na dica. Tecla tratada uma vez.
5. Nada de campo além de `pivotX/pivotY`. Se o código pedir outro, parar e escrever em Desvios.
6. Ao fim do lote 56: `ESTADO.md` fecha a D5 e a pendência 15 (`PENDENCIAS`), e "Decisões em aberto" ganha a linha do que foi decidido hoje. O `PLANO peças e mechas` continua na gaveta.
7. Três linhas ao Humberto por lote.

## O que fica de fora, e onde está anotado

| O que | Por quê |
|:---|:---|
| Ponto animado por quadro (D4) | ele disse "vejo depois"; continua em `PENDENCIAS` 15 |
| PSD como pele, pasta pareada por nome (portas 1 a 3 da pesquisa) | rendem depois deste plano; ficam no `PLANO peças e mechas` |
| Pivô em malha | malha tem vértices; não é o mesmo problema |
| Importador do Spriter gravar pivô no atlas em vez de assar | o pivô do Spriter varia por chave; assar continua certo. Reabrir se o Humberto pedir |

**Glacê deste plano**, para a tabela do `PENDENCIAS` (itens 30 em diante): `pivot_x/pivot_y` no runtime Python · caso de conformidade A-036 (pivô não mexe na pose, nos dois runtimes) · manual caps. 2, 3, 4 e 8 (pivô, Carimbar, Duplicar no atlas, Montar enquanto anima, Definir pivô) · §10.3 no validador do site.

## Aprovado pelo Humberto em 10/09/2026

O planejador anotou a decisão no `ESTADO.md` (decisão 19) e o glacê no `PENDENCIAS` (itens 30 a 33). O executor termina o lote aberto, faz 55 → 58, volta ao que faltar de 49 → 52.

## Próximos passos, depois destes quatro lotes

Tudo bolo. Nada aqui é glacê.

### 1. A fila do executor, na ordem

| Ordem | O que | Estado |
|:---:|:---|:---|
| 1 | Lotes 49 a 52 da rodada 5 (avisos com nome, arrastar entre linhas, PNG em `.zip`, altura dos painéis) | em andamento |
| 2 | Lotes 55 a 58 deste plano (pivô no atlas, carimbar e trocar, Animando livre, pivô à mão) | esperam o aviso do Humberto |
| 3 | Rodada 6: as anotações do Humberto usando o programa | esperam ele testar |

### 2. Rodada 6 — o Humberto testa, o planejador transforma em lotes

Foi assim que a rodada 3 rendeu mais (16 anotações, lotes 23 a 29, e depois 31 a 38). O roteiro é o **fluxo padrão** do cap. 00 do manual, de ponta a ponta, com um personagem novo, não o herói:

1. Importar o PSD com ossos → 2. Ajustar pais e pivôs → 3. Pele nova com a mão maior → 4. Animar `idle`, `walk`, `attack` com Transformar → 5. Trocar de animação tocando → 6. Exportar folha, WebM e `.bonez` por pele.

Cada passo que trava, pede tecla escondida ou não tem botão à vista vira uma linha. O planejador agrupa em lotes de 3 a 5 linhas.

### 3. Se ele não tiver anotações: a lista do que sobrou, por valor

Do `ESTADO.md` ("Acabamento") e do `PENDENCIAS`, tirado o que é glacê e o que espera decisão.

| Ordem | O que | Por que vale | Tamanho |
|:---:|:---|:---|:---:|
| 1 | **PSD como pele de…** (porta 1 da pesquisa do pivô) | a fantasia do Mickey sem clique: o segundo PSD no mesmo quadro vira pele. Fecha o caso que abriu a conversa do pivô | médio |
| 2 | Curvas de **quicar** e **oscilar** de verdade (gerador de chaves) | as duas que existem são de um segmento só; Spine e Moho têm | médio |
| 3 | Botão **Manter UV** ao mover vértice (`keepUv` existe, sem botão) | esticar a imagem sobre a malha é gesto de todo dia | pequeno |
| 4 | **Zoom e deslocamento** no painel Curvas | hoje mostra sempre a animação inteira | pequeno |
| 5 | **Espelhar** também em slot, `deform` e sequência | hoje só osso; a pose espelhada sai com a mão errada | médio |
| 6 | **Copiar a mistura da Prévia** com tudo dentro (evento, ordem, cor, `deform`…) | hoje só os ossos; a lista do que falta está na tela | médio |
| 7 | **Encadear** três animações numa camada da Prévia | trocar no meio da transição descarta a de saída | pequeno |
| 8 | Traçado de silhueta com **buraco** | um buraco no desenho fica dentro da malha | médio |
| 9 | Régua do tempo em **milissegundos**, como opção | `PENDENCIAS` 6; só conta na tela | pequeno |
| 10 | **Atalhos remapeáveis** | `PENDENCIAS` 7; a tabela Ajuda → Atalhos já existe, então o "primeiro a tabela" está feito | médio |
| 11 | Mover vértice em Montagem **sem recarregar** o arquivo | as chaves já não recarregam | pequeno |

### 4. O que espera uma palavra do Humberto, e trava bolo

| # | Pergunta | Onde |
|:---:|:---|:---|
| 27–29 | Linha de comando, glTF e importadores de Spine/DragonBones/Spriter: **bolo ou glacê?** | `PENDENCIAS`, "Ainda não decidido" |
| D4 | Ponto animado por quadro: ele disse "vejo depois" | `PENDENCIAS` 15 |
| 9 | "Libera o socket": espada por encaixe de nome, arma com animação própria, pele que vem de fora | `PLANO peças e mechas`, na gaveta |

### 5. O que quer dizer "programa pronto"

Para ele dizer "pronto" e o glacê começar, uma lista curta, conferível:

| Conferência | Como se prova |
|:---|:---|
| O fluxo padrão (cap. 00) roda de ponta a ponta **sem tecla escondida** | a lista "O básico que falta" fica vazia de novo, com um personagem que não é o herói |
| Nenhum capítulo do manual tem linha em "O que ainda não funciona" que seja bolo | `grep` nos oito capítulos; o que sobrar é glacê ou decisão |
| `auditMenus` vazio; todo botão com ícone e nome na dica | testes `lote-menus` e `lote26` |
| Cena ≥ 70% da altura em 1440×900, console limpo | a medição da rodada 3, repetida |
| Salvar → fechar → abrir → salvar dá o **mesmo arquivo**, texto contra texto, no herói e no personagem novo | teste que já existe para o herói, estendido |
| Os 53 casos de conformidade continuam passando no runtime TypeScript | `node ferramentas/conformidade.mjs` |

## Desvios

(o executor escreve aqui)

### Lote 55 — v8.0

Não havia lote aberto: o 49 não tinha começado (nenhum arquivo mudou desde a
linha de base dele). Ponto de partida: v7.9, 2.286 passando + 29 pulados = 2.315, 53/53.

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | o empacotador passa o pivô "sem conta" | com `scale ≠ 1` ele reamostra a imagem, e `originalWidth` muda junto | o pivô é multiplicado pela mesma razão (§10.5: todo px do atlas é px da página). Sem escala, nenhuma conta |
| 2 | nada sobre apelidos | o empacotador junta desenhos idênticos numa região só (`aliases`); a cópia do "Duplicar no atlas" (lote 56) seria engolida de volta, com o pivô da primeira | o pivô entrou na chave de conteúdo: mesmo desenho com pivô diferente fica região própria. Teste prende |
| 3 | a fórmula, sem `scale` | ela mistura `x/y` do anexo (px de esqueleto) com `ow/oh` (px do atlas) | o texto da §10.3 diz "tudo já dividido por `scale`". O lote 56 faz a conta assim |
| 4 | `validar.mjs` e `nucleo.js` aceitam number | o tipo vem do schema, e não há faixa: nenhum dos dois precisou de linha nova | só `construir-esquema.mjs` rodado. O teste chama a linha de comando de verdade: número passa, texto é recusado |
| 5 | "próxima versão livre" | a rodada 5 tinha reservado v8.0 para o lote 49 | lote 55 = **v8.0**. Os lotes 49 a 52 pegam o número livre quando voltarem |
| 6 | — | o gravador binário (`.boneb`) do atlas guarda número que não é inteiro como `f32` | fica assim: a spec diz `number`. Pivô com mais de 7 algarismos perde casas no binário, não no JSON |

### Lote 56 — v8.2

Outro chat fez um conserto no meio (v8.1, 10/09 às 19:31: soltar imagem não
apaga as peças). As mudanças dele entraram antes da cópia `editor-src` deste
lote; nada dele foi regravado.

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | soltar imagem num "placeholder vazio na aba Peles" | a aba Peles só lista peles; não há linha de slot para receber a imagem | só a Árvore recebe: no **slot**, desenho novo; no **desenho**, troca |
| 2 | `SwapSlotImage` "hoje: só `path`" | o comando existia e ninguém o chamava | ganhou porta: soltar imagem num desenho da Árvore troca aquele desenho (4º parâmetro, o nome do desenho) |
| 3 | `stampPivots(heroi)`: `stamped` = número de regiões | `face` é malha e fica de fora, como o plano manda; a sequência `hand_` conta quadro a quadro | 20 de 21 regiões no herói. O teste diz quais |
| 4 | os avisos vão para a barra de avisos | a barra se refaz de `doc.warnings` a cada passo e apagaria o aviso; e o botão Duplicar tem que ficar ao lado dele | os avisos ficam no painel Imagens, cada um com o botão Duplicar; o rodapé diz "veja o painel Imagens" |
| 5 | salvar grava o atlas carimbado | Salvar só gravava atlas **importado**; o aberto do disco nunca era regravado | o aberto do disco é regravado (só o `.atlas.json`) quando o carimbo, um Carimbar ou um Duplicar o mudou |
| 6 | — | o conserto v8.1 pôs o pacote importado **ao lado** do atlas do arquivo, com nome próprio | um arquivo por atlas, cada um com o seu nome; o `.bonez` passou a levar as páginas de todos os atlas (com pacote, pulava as do arquivo) |
| 7 | "próxima versão livre" | a v8.1 foi do conserto | lote 56 = **v8.2** |
| 8 | `heroi.atlas.json` regravado "pelo editor" | o mesmo `stampPivots`, rodado por script sobre a árvore original | o arquivo mudou só nas 40 linhas de `pivotX/pivotY`; cabeçalho e ordem ficaram. `gerar-arte-exemplo.mjs` grava sem pivô: se for rodado de novo, carimbar outra vez |
| 9 | Duplicar: "depois cada cópia carimba sozinha" | — | a cópia já sai carimbada, no mesmo passo de desfazer |
| 10 | — | a conta com giro dá dízima | pivô com 4 casas, como o resto do editor; a imagem cai a 0,0001 px do lugar |
| 11 | — | três testes do lote 39 usam um documento sem `atlases` | a troca aceita documento sem atlas (fica sem pivô). Os testes antigos não mudaram |

### Lote 57 — v8.3

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | mudam de expectativa: lotes 33, 26 e 38 | 26 e 38 não tinham a lista de Animando; quem tinha eram os lotes 11 e 30 | três testes mudaram de expectativa (11, 30, 33). A contagem não caiu |
| 2 | reaproveitar `pruneTimelines`, "código que ninguém chama" | ele é chamado por `applyRemoval` (Remover osso e Remover slot); quem não chamava era o `DeleteItems` da Árvore | `DeleteItems` chama `applyRemoval` inteiro: poda as linhas e também máscara, morph, parâmetro e ordem de desenho. O desfazer guarda o arquivo inteiro e devolve o mesmo texto |
| 3 | Criar osso vale nos dois modos | `Alt` (redesenhar) e `Ctrl` (prender desenhos) regravariam a Montagem de coisas que já existem, a partir da pose animada | em Animando os dois dizem "é da Montagem. Ctrl+Tab troca de modo"; o criar simples vale |
| 4 | osso medido contra o pai animado | o esqueleto da cena já está posado na animação aberta | nenhuma conta nova: bastou tirar o `modes`. O teste prova com um osso que a `walk` gira |
| 5 | `appearKeys(t)` | a chave precisa do nome do desenho | `appearKeys(t, nome)`, e a gravação usa o mesmo `setKey` das outras chaves |

### Lote 58 — v8.4

| # | O plano dizia | O código pediu | O que ficou |
|:---:|:---|:---|:---|
| 1 | Copiar / Colar pivô "entre imagens escolhidas" | a aba Imagens não tem imagem escolhida | Copiar e Colar ficam no botão direito de cada imagem; o copiado vale até fechar a aba, como a âncora copiada |
| 2 | botão com ícone | o botão precisa saber de qual imagem | ícone de mira ao lado do Carimbar: abre a janela da imagem do desenho escolhido na Árvore; sem desenho escolhido, o rodapé diz o que fazer |
| 3 | recoloca com `placeByPivot` | a volta da §10.3 é sem `width/height`; recolocar sem eles encolheria o desenho esticado | `placeByPivot(…, keepSize)`: recoloca mantendo o tamanho. Carimbar de novo dá o mesmo pivô (teste) |
| 4 | — | um quadro de sequência não pode mover o anexo dos outros quadros | desenho em sequência não é recolocado |
| 5 | — | na conferência na tela, o clique da automação não chega com o painel do navegador escondido | menu e janela conferidos disparando o clique no próprio botão: abrem com título, aviso, nove pontos, leitura e os dois botões. Nada foi gravado no herói |

**Os quatro lotes do plano estão feitos** (v8.0, v8.2, v8.3, v8.4). Próximo, pela ordem do plano: lotes 49 a 52 da rodada 5.
