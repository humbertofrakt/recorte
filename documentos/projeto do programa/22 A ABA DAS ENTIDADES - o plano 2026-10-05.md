# A aba das entidades — o plano

Rodada 10. Escrito pelo `PLANEJANDO · rodada 10 — a aba das entidades`, 05/10/2026, 21h.
Ficha: `rodadas/RODADA 10 - a aba das entidades o plano 2026-10-05.md`.
**Só plano. Nenhum código.** O Humberto lê e aprova antes.

---

## Em cinco linhas

| # | |
|:---:|:---|
| 1 | A aba Entidades vira uma **árvore de cartões**: caixa dentro de caixa. Quem está dentro de quem se lê de cima para baixo. **Sem fio.** |
| 2 | **O projeto aberto é um cartão**, com a cor de "você está aqui". Ele pode estar no topo, ou dentro do slot de outro (o mecha, a nave). |
| 3 | **Ligar = arrastar um cartão para a linha de um slot.** Ligação nova é **teste**: borda tracejada e a palavra **teste**. A do projeto: borda cheia e a palavra **projeto**. |
| 4 | O teste **não vai para o `.bone`**. Mora no `manifest.json` do projeto, que o jogo ignora. **Nada muda no formato.** |
| 5 | Sete lotes, um por versão. O primeiro só **mostra** (o projeto como cartão, o que já está dentro de quê). O teste vem no segundo. |

---

## 1. A pesquisa

### 1a. O que os outros fazem

Prefixo local: `documentos/pesquisa/nova pesquisa/`. Pesquisa de 05/10/2026, à noite.

**Ver a peça dentro de outra**

| Programa | O que faz | Fonte |
|:---|:---|:---|
| Spriter | tem sub-entidade: animação dentro de animação. **O passo a passo na tela não tem fonte** (o manual 1.4 não tem o capítulo) | [brashmonkey.com/spriter-pro](https://brashmonkey.com/spriter-pro/) |
| Spriter | recusa **ciclo**: "uma entidade não pode ser sub-entidade dela mesma" (consertado na R11; antes corrompia) | [notas da R11, Steam](https://store.steampowered.com/news/posts/?feed=steam_community_announcements&appids=332360&enddate=1520083913) |
| Spriter | no arquivo, a sub-entidade é um objeto da linha do tempo: entidade + animação + ritmo | [SCML Reference](https://www.brashmonkey.com/ScmlDocs/ScmlReference.html) |
| Spine | **o editor não mostra** um esqueleto dentro de outro. Só por código | [fórum Esoteric, 1407](https://esotericsoftware.com/forum/d/1407-nested-spine-skeletons-amp-animations) · [1655](https://esotericsoftware.com/forum/d/1655-feature-request-nested-animations) |
| Spine | a árvore lista os esqueletos; a ordem na árvore é a ordem de desenho | `spine/Spine User Guide - manual completo 2026-09-08.pdf`, p. 12 e 16 |
| Spine no Godot | `SpineSlotNode` põe um nó (até outro Spine) na ordem de desenho de um slot | [spine-godot](https://esotericsoftware.com/spine-godot) |
| DragonBones | o slot pode mostrar um **esqueleto filho**; trocar a arma = trocar o filho do slot | [formato 5.5](https://unpkg.com/dragonbones-tools@0.1.2/doc/dragonbones_json_format_5.5.md) · [Slot.ts](https://raw.githubusercontent.com/DragonBones/DragonBonesJS/master/DragonBones/src/dragonBones/armature/Slot.ts) |
| DragonBones | vários esqueletos no Repositório; passar o mouse mostra a prévia. **Como se encaixa no editor: sem fonte** | [docs Egret, arquivada](https://web.archive.org/web/2021/https://docs.egret.com/dragonbones/en/docs/dbPro/basicConcept/framework) |

**Ligar por arrasto, com teste antes de valer**

| Programa | O que faz | Fonte |
|:---|:---|:---|
| **Spriter** (o mais perto) | Character Maps: arrasta o mapa para "ativo", **vale na hora na tela**, e **"Bake Active To Entity"** grava na entidade | `spriter/Spriter Pro - manual oficial 1.4.pdf` ("Activating and Stacking Character Maps") · `spriter/Spriter - todas as funcoes 2026-09-08.md`, §5.4 |
| Unity | prefab dentro de prefab: arrasta para a hierarquia. O que foi acrescentado ganha **"+"**; **Apply** grava, **Revert** desfaz | [Nested Prefabs](https://docs.unity3d.com/2022.3/Documentation/Manual/NestedPrefabs.html) · [Editing via instance](https://docs.unity3d.com/2022.3/Documentation/Manual/EditingPrefabViaInstance.html) |
| Unity | o que é diferente do original: nome em **negrito** e **linha azul** na margem | [Instance Overrides](https://docs.unity3d.com/2022.3/Documentation/Manual/PrefabInstanceOverrides.html) |
| Godot | instanciar uma cena dentro de outra: botão de corrente, ou arrastar | [Instancing](https://docs.godotengine.org/en/stable/getting_started/step_by_step/instancing.html) |
| Unreal Blueprint | fio de pino a pino; pino vazio = solto, cheio = ligado | [Nodes](https://dev.epicgames.com/documentation/en-us/unreal-engine/nodes-in-unreal-engine) |
| Niagara | **não é fio**: pilhas de módulos | `Sistemas de particula - PET Unity Niagara Godot 2026-09-23.md`, linha 16 |
| Photoshop | arrastar a camada para dentro do grupo; o objeto inteligente abre por dentro | [Smart Objects](https://helpx.adobe.com/photoshop/using/create-smart-objects.html) (a página deu 403; só o resumo) |

**Mostrar o que é teste**

| Programa | O que faz | Fonte |
|:---|:---|:---|
| Unity | no Play, **a tela inteira muda de cor**; o que se mexe ali se perde | [Preferences, Playmode Tint](https://docs.unity3d.com/2022.3/Documentation/Manual/Preferences.html) |
| Godot | rodando: abas **Remoto** e **Local**; o remoto some ao parar | [Debugging tools](https://docs.godotengine.org/en/stable/tutorials/scripting/debug/overview_of_debugging_tools.html) |
| Spine | a Preview toca e mistura **sem mudar** a montagem; várias skins à vista na aba Skins | `spine/Spine User Guide…pdf`, "Preview view", p. 213 |
| Spriter | os mapas ativos valem na tela e ficam num arquivo à parte (`.scms`) até o "Bake" | `spriter/Spriter - todas as funcoes 2026-09-08.md`, §5.4 |

**O que isso diz para nós**

| | |
|:---|:---|
| O Spriter já tem **o nosso gesto**: testar na tela, e um botão que grava | "Pôr no projeto" é o **Bake Active To Entity** dele |
| O Spriter guarda o teste **fora** da entidade (`.scms`) | nós guardamos fora do `.bone` (no `manifest.json`) |
| **Ninguém** mostra no editor a cadeia para cima (o boneco dentro do mecha) | é nosso. Por isso o cuidado com o desenho |
| Todos recusam o ciclo | nós também, **no arrasto**, antes de soltar |

### 1b. O que o nosso programa já tem (conferido no código)

| O que | Onde | Serve para |
|:---|:---|:---|
| A aba Entidades: lista de miniaturas paradas, arrastar para a cena | `editor/src/panels/palette-entities.ts:41-169`; arrasto em `:127-133` | o cartão da prateleira nasce dela |
| A lista vem do projeto (`entidades`) | `panels/palette-entities-model.ts:52-59` | idem |
| O botão direito da aba tem **um** item: Promover a base | `palette-entities.ts:145-153` | |
| A miniatura de qualquer esqueleto | `panels/entity-thumb.ts` | o cartão do projeto usa a mesma |
| O menu Entidades: pôr na cena, marcar como slot, desmarcar, promover, escolher animação, em laço, Este boneco, tirar | `panels/entities-actions.ts:391-440` | o cartão chama **a mesma conta** |
| Marcar como slot (rodada 9): a marca mora no anexo, em `RECORTE_editor_state.slotMarcado` | `panels/slot-base-model.ts:36-37`, comando `:197` | as linhas de slot do cartão |
| Pendurar a entidade (cria slot e anexo `skeleton`) | `doc/drop-entity.ts:150` | "Pôr no projeto", para baixo |
| "Este boneco" (o campo `around`) | `anim/entity-around.ts:113` | "Pôr no projeto", para cima |
| Trocar todas as iguais (N) | `panels/image-picker-model.ts:763` | as rodas |
| A faixa: escolher a animação da entidade (aceita `null`) | `panels/dopesheet-actions.ts:117` | "anima:" no cartão |
| **A cena montada**: animando a espada por dentro, o herói fica à vista, parado, sem o slot dela | `doc/projeto.ts:155-163`; desenho `viewport/viewport-draw.ts:111-122` | é **um nível** do que a rodada pede |
| A âncora: o boneco em foco preso ao slot de outro, **recalculada a cada pose** | `panels/animations-actions.ts:291-302`; `doc/document.ts:644-665` | o herói dentro do mecha |
| Abrir a entidade por dentro, e voltar | `animations-actions.ts:326-367` e `:380` | subir e descer um nível |
| **A Visualização em tela cheia já testa skins**, sem mexer no arquivo, e diz isso na tela | `panels/preview.ts:369-404`; frase em `:461`; pilha de teste `:477` e `:676` | o mesmo jeito de teste, e a mesma frase |
| A Visualização usa um **esqueleto à parte** | `preview.ts:660-683` | o teste não toca a cena |
| A lista do projeto (corpos, entidades, foco) mora em `manifest.extras.RECORTE_projeto` | `doc/projeto.ts:42`; spec 2.9, `formato/ESPECIFICACAO 2026-09-17.md:429` | **é onde a montagem de teste mora** |
| A coluna tem **260 px** | `ui/layout-model.ts:86`; o painel solto nasce com 280 | o cartão cabe em 260 |
| A aba fica atrás de Imagens (Montar) e de Animações (Animar) | `ui/contexts.ts:55` e `:65` | não muda de lugar |

| O que **não** existe | |
|:---|:---|
| cartão, slot visível na aba, ligação de teste | nada |
| o projeto aparecer na aba | nada |
| a cena com **dois ou mais** níveis em volta | só um (a cena montada) |
| "Aparecer na linha do tempo" | nada |
| testar a skin da **entidade** | só a do boneco aberto, na Visualização |

---

## 2. O desenho da aba

### A ideia: caixa dentro de caixa

O Humberto pensa em **encaixe**. Fio cruza; caixa não cruza.
Uma linha de slot **contém** o cartão que está nela. Lê-se de cima para baixo.

```
┌──────────────────────────────────────────────┐
│ ENTIDADES                                    │
│ [Na cena] [Pôr no projeto] [Mais]            │
│                                              │
├──────────────────────────────────────────────┤
│ MONTAGEM                                     │
│ ┌┄ nave ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ TESTE ┄┐     │
│ ┆ anima: voar                          ┆     │
│ ┆ cabine                               ┆     │
│ ┆ ┌┄ mecha ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ TESTE ┄┐ ┆     │
│ ┆ ┆ anima: andar                     ┆ ┆     │
│ ┆ ┆ piloto                           ┆ ┆     │
│ ┆ ┆ ╔═ BONECO ══════════════ AQUI ═╗ ┆ ┆     │
│ ┆ ┆ ║ mão_d                        ║ ┆ ┆     │
│ ┆ ┆ ║ ┌─ motosserra ─── PROJETO ─┐ ║ ┆ ┆     │
│ ┆ ┆ ║ │ anima: livre             │ ║ ┆ ┆     │
│ ┆ ┆ ║ └──────────────────────────┘ ║ ┆ ┆     │
│ ┆ ┆ ║ mão_e   vazio · solte aqui   ║ ┆ ┆     │
│ ┆ ┆ ║ + outra imagem…              ║ ┆ ┆     │
│ ┆ ┆ ╚══════════════════════════════╝ ┆ ┆     │
│ ┆ └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘ ┆     │
│ └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘     │
│                                              │
├──────────────────────────────────────────────┤
│ PRATELEIRA  (arraste para um slot)           │
│ [poder rosa] [motosserra] [canhão]           │
│ [nave] [mecha] [espada]                      │
└──────────────────────────────────────────────┘
```

**Em 1280×720, dobrado:** só a cadeia do projeto aberta; os de fora viram a trilha.

```
┌──────────────────────────────────────────────┐
│ ENTIDADES                                    │
│ [Na cena] [Pôr no projeto] [Mais]            │
│                                              │
├──────────────────────────────────────────────┤
│ MONTAGEM                                     │
│ nave › mecha › BONECO        (a trilha)      │
│                                              │
│ ╔═ BONECO ══════════════════════ AQUI ═╗     │
│ ║ ▸ mão_d   motosserra       PROJETO   ║     │
│ ║ ▸ mão_e   vazio · solte aqui         ║     │
│ ║ + outra imagem…                      ║     │
│ ╚══════════════════════════════════════╝     │
│                                              │
├──────────────────────────────────────────────┤
│ PRATELEIRA  (arraste para um slot)           │
│ [poder rosa] [motosserra] [canhão] …         │
└──────────────────────────────────────────────┘
```

| Peça do desenho | Como é |
|:---|:---|
| **Montagem** (em cima) | a árvore. O cartão de fora fica no topo. Cada nível entra 12 px |
| **Prateleira** (embaixo) | todas as entidades do projeto, em miniatura, como hoje. **Arrastar daqui copia**: a mesma entidade pode entrar várias vezes |
| **O cartão do projeto** | moldura **dupla**, cor de destaque, e a palavra **AQUI** (a dica diz: *"o projeto aberto: é ele que você anima"*). É o único que se anima na linha do tempo. Não está na prateleira: há um só |
| **Ligação do projeto** | borda cheia + a palavra **projeto** |
| **Ligação de teste** | borda **tracejada** + a palavra **teste** + cor de aviso. **Três sinais, nunca só a cor** |
| **Linha de slot** | o nome do slot à esquerda; o cartão (ou "vazio · solte aqui") à direita |
| **Que slots aparecem** | os **marcados** (rodada 9) e os que **já têm** uma entidade. Os outros ficam em **"+ outra imagem…"**: qualquer imagem pode receber (regra 1), sem encher a aba |
| **Barra de cima** | três botões, cada um **ícone + palavra**, e o nome na dica |

### Nas três telas

| Tela | O que muda |
|:---|:---|
| **1920×1080** (a dele) | a coluna tem 260 px. Cabem 4 níveis abertos sem cortar o nome. A aba pode sair da parede (o painel solto) e ficar larga |
| **1440×900** | igual. A prateleira com 2 linhas; a montagem rola |
| **1280×720** (a pior) | a aba divide a coluna com outro grupo. **Cartão dobrado** por padrão: só o nome e a palavra teste/projeto. Abre-se o que se mexe. A cadeia do projeto **nasce aberta** |

**Mais de 4 níveis:** os de fora viram uma **trilha** no topo: `nave › mecha › BONECO`. Clicar num nome abre aquele nível.

---

## 3. Cada gesto

Rodapé = a frase na barra de baixo. Desfazer = `Ctrl+Z`, **um passo por gesto**.

| Gesto | Antes ele vê | Faz | Depois ele vê | O rodapé diz |
|:---|:---|:---|:---|:---|
| **Ligar para baixo** | a motosserra na prateleira; o slot `mão_e` vazio | arrasta a motosserra para a linha `mão_e` | a motosserra no `mão_e`, **tracejada, teste** | *"Motosserra na mão_e: teste. A animação não muda."* |
| **Desligar** | a ligação de teste | arrasta o cartão para fora, ou ⋯ → Desligar | o slot vazio de novo | *"Motosserra saiu da mão_e (era teste)."* |
| **Trocar a peça** | a motosserra no `mão_e` | solta o canhão em cima dela | o canhão no lugar, teste | *"Canhão no lugar da motosserra, na mão_e: teste."* |
| **Ligar para cima** | o boneco no topo | arrasta **o cartão do projeto** para a linha `piloto` do mecha | o mecha no topo; o boneco dentro dele | *"O boneco entrou no mecha, no piloto: teste. O boneco não leva o mecha."* |
| **"Este boneco"** | o poder rosa na prateleira | arrasta o projeto para a linha `meio` do poder | o poder em volta do boneco: metade atrás, metade na frente | *"O boneco no meio do poder rosa: teste."* É a mesma conta da v27.5 |
| **Escolher a animação da peça** | "anima: parado ▾" no cartão | escolhe na lista | a peça toca aquela | teste: *"O mecha toca andar (teste)."* Projeto: é a faixa, e cria a chave no instante, como o botão direito na faixa |
| **Soltar para o jogo** | "anima: andar ▾" | escolhe **"livre — o jogo escolhe"** | a peça parada, com a palavra livre | *"Ninguém manda na motosserra: o jogo escolhe."* |
| **Testar skins** | "skins: default ▾" no cartão de uma entidade | liga e desliga | a peça vestida | *"Skin águia no mecha: teste. O arquivo do mecha não muda."* A do boneco aberto continua na aba Skins e na Visualização |
| **Na cena** ("Aparecer na linha do tempo") | o botão apagado | clica | a cena desenha a montagem em volta do boneco | *"A montagem de teste está na cena. Ela não entra na animação."* |
| **Pôr no projeto** | uma ligação de teste escolhida | clica | borda cheia, a palavra projeto | ver abaixo |
| **A mesma entidade duas vezes** | o canhão na prateleira | solta na mão_d e na mão_e | dois cartões, "canhão 1 de 2" e "2 de 2"; trocam separados | *"Outro canhão na mão_e: teste. São dois, separados."* |
| **As rodas** | 4 slots com a mesma imagem | solta a roda nova numa delas | aparece **"Trocar todas as iguais (4)"**, desligado | como a grade da v28.7 |
| **Descer um nível** | o canhão dentro do boneco | duplo clique no cartão (ou ⋯ → Animar por dentro) | o canhão vira a base em foco; o boneco à vista, em volta | o mesmo de hoje (rodada 8b) |
| **Subir um nível** | animando por dentro | clica no nome de cima na trilha | volta ao boneco | o mesmo de hoje |

### "Pôr no projeto"

Só escreve **no arquivo aberto**. Nunca noutro.

| A ligação | O que grava no boneco | Onde vale |
|:---|:---|:---|
| **Para baixo** (a motosserra na mão) | a entidade no slot, como a grade faz | **na base**: em todas as animações. **Numa animação**: só nela, da agulha em diante. Regra do `02` |
| **Para cima** (o boneco no poder, no mecha) | o de fora entra **no boneco**, com **"Este boneco"** no slot onde o boneco estava | idem |
| Dois níveis para cima (o mecha **na nave**) | nada: a nave não é o arquivo aberto | o botão diz por quê: *"A nave leva o mecha, e nenhum dos dois é o arquivo aberto"* |

`Ctrl+Z` volta a ligação a **teste**. Um passo.

**Atenção, para cima:** depois de "Pôr no projeto", **o boneco leva o mecha junto**. No teste ele não levava. O rodapé avisa. Ver a pergunta 3.

---

## 4. Teste contra projeto

| Quando | O teste | O projeto |
|:---|:---|:---|
| **Na aba** | tracejado, palavra **teste**, cor de aviso | borda cheia, palavra **projeto** |
| **Na cena** | desenhado **normal** (para julgar como fica); faixa no canto: *"Montagem de teste à vista: 3 peças. Não entra na animação"* | normal |
| **Salvar** | **não vai** para o `.bone`. Vai para `manifest.json`, em `extras.RECORTE_projeto.montagem` (do editor; o jogo ignora) | vai para o `.bone`, como hoje |
| **Fechar e reabrir** | volta como estava, com **Na cena** como estava | igual |
| **Trocar de animação** | **fica**. A montagem é do projeto, não da animação | |
| **Exportar para o jogo** | nada sai | sai como hoje |
| **Ctrl+Z** | desfaz o gesto de teste, um por um | |

**Prova a fazer (lote 2):** o `.bone` do boneco gravado **com** e **sem** montagem tem de sair **igual, byte a byte**.

---

## 5. A cena enquanto ele anima

Com **Na cena** ligado: a nave, o mecha em volta, o boneco no piloto, a motosserra na mão.

| O quê | Desenha? | Clica? | Mexe pela animação do boneco? |
|:---|:---:|:---:|:---:|
| O boneco | sim | **sim**, como sempre | sim |
| As peças **do projeto** dentro dele | sim | sim, como hoje | sim (pela faixa) |
| As peças **de teste** dentro dele (a motosserra de teste) | sim | **não**: o clique passa | segue o osso do boneco |
| **Quem está em volta** (o mecha, a nave) | sim, por trás e pela frente | **não** | **não**. Toca a animação do cartão dele, no relógio da agulha. "parado" = a pose de repouso |

| Regra | |
|:---|:---|
| O boneco segue o slot do mecha | sim. Se o mecha anda, o boneco anda junto **na tela**. As chaves do boneco **não** mudam. É a âncora de hoje (`document.ts:644`), em mais níveis |
| A câmera | não pula ao ligar. **A conferir no uso**: se ele quer a câmera presa no boneco |
| A linha do tempo | as peças de teste **não têm faixa**. Uma linha só, cinza e tracejada, no fim: *"Montagem de teste: mecha (andar), nave (parado). Não entra na animação."* Só lê |
| A Visualização (tela cheia) | mostra a montagem inteira, sempre |

---

## 6. Os casos difíceis

| Caso | Resposta |
|:---|:---|
| **Ciclo**: pôr o mecha dentro do boneco, com o boneco dentro do mecha | **recusa**. Ao arrastar, a linha fica vermelha e o cursor diz não. Rodapé: *"O mecha já leva o boneco. Pôr o mecha no boneco faria uma volta sem fim."* (spec 7.11, L1) |
| **Fundo demais**: mais de 8 níveis | recusa, com o motivo (spec 7.11: profundidade 8) |
| **A entidade sumiu do disco** | o cartão fica, com **"?"** e a palavra **falta o arquivo**. A ligação **não** some. Nada é desenhado no lugar. A barra de avisos diz o nome (regra 21) |
| **Dois níveis com "Este boneco"** (o boneco no poder; o poder na faísca) | desenha pela cebola da spec (C-324). "Pôr no projeto" leva só o poder; a faísca fica teste: ela entraria no arquivo do poder |
| **A peça de teste com animação que o boneco não tem** ("igual ao boneco") | ela fica parada; o cartão diz *"o mecha não tem pilotar: parado"* (regra do `02`) |
| **Teste vira projeto, e o slot já tem peça do projeto** | **troca**, como a grade: a de antes sai. Rodapé diz qual saiu. `Ctrl+Z` devolve. Sem janela de pergunta |
| **A base-slot é desmarcada**, com teste nela | o slot continua lá (só perdeu o nome): a ligação **fica**. Se o slot **sumir**: o teste vai para **"sem lugar"**, no topo do cartão, com Desligar. Nunca some calado |
| **10 entidades, 30 slots** | cartões dobrados; só slots marcados e ocupados à vista; prateleira em grade de 6. **Medir** em 1280×720 no lote 7 |

---

## 7. O que o jogo recebe

**Nada muda no formato.** Conferido na spec:

| | |
|:---|:---|
| Peça dentro de peça | é o anexo `skeleton` (7.11), que já existe |
| "Este boneco" | é o campo `around` (7.11, desde a 1.1), que já existe |
| A montagem de teste | `manifest.extras.RECORTE_projeto` (2.9): *"estado do editor, e um leitor os ignora"* |
| Ciclo e profundidade | já são regra (7.11) |

Nenhum campo novo no núcleo. **Nada para o Humberto decidir no formato.**

---

## 8. O que não copiar

| Não copiar | Por quê | Fonte |
|:---|:---|:---|
| **O fio** (Blueprint) | vira "espaguete"; precisa de truque para desembaraçar. Caixa dentro de caixa não cruza | [blog uhiyama-lab](https://uhiyama-lab.com/en/notes/ue/blueprint-spaghetti-code-prevention-techniques/) |
| **A tela inteira colorida** (Unity, Play) | pinta o que é projeto também. Nós marcamos **só a peça de teste** | [Playmode Tint](https://docs.unity3d.com/2022.3/Documentation/Manual/Preferences.html) |
| **O teste que some calado** (Godot, Remoto) | quem não vê a diferença perde trabalho achando que valeu. Nosso teste **fica guardado**, e diz que é teste | [Debugging tools](https://docs.godotengine.org/en/stable/tutorials/scripting/debug/overview_of_debugging_tools.html) |
| **O "porque não mudou" escondido** (Unity, override) | o original muda e a cópia não, sem dizer. Nossa ligação de teste **sempre** diz que é teste | [Instance Overrides](https://docs.unity3d.com/2022.3/Documentation/Manual/PrefabInstanceOverrides.html) |
| **O botão só na raiz** (Unity, Overrides) | não aparece nos aninhados. Nosso "Pôr no projeto" age em **qualquer** ligação que toca o arquivo aberto | [Editing via instance](https://docs.unity3d.com/2022.3/Documentation/Manual/EditingPrefabViaInstance.html) |
| **Mostrar certo no editor e perder no jogo** (Spine, aninhado só por código) | nada que o teste mostra vira jogo sem passar pelo "Pôr no projeto", que só grava o que a spec já lê | [fórum 1655](https://esotericsoftware.com/forum/d/1655-feature-request-nested-animations) |
| **O ciclo que corrompe** (Spriter antes da R11; Unity antes da 2022.2) | recusar **no arrasto**, não depois | [R11](https://store.steampowered.com/news/posts/?feed=steam_community_announcements&appids=332360&enddate=1520083913) · [Unity issue](https://issuetracker.unity3d.com/product/unity/issues/guid/1395865/) |

---

## 9. Os lotes

Um lote = uma versão. Do que mais muda a vida dele para o que menos.

| Lote | O que ele vai ver | Arquivos | O que pode quebrar |
|:---:|:---|:---|:---|
| **1** | A aba com **o projeto como cartão**, e a árvore do que **já** está dentro de quê (só o projeto, borda cheia). Prateleira embaixo. Nada de teste ainda | `panels/palette-entities.ts`, `palette-entities-model.ts`, um `entities-cards-model.ts` novo, o CSS da aba, testes da parte | o arrastar para a cena de hoje; a medição de altura |
| **2** | **Ligar para baixo em teste**: arrastar para o slot, desligar, trocar. Tracejado e a palavra. Salva no `manifest.json`. `Ctrl+Z`. A Visualização mostra a montagem | `doc/projeto.ts`, um `doc/montagem.ts` novo, `io/project-open.ts`, `io/open-save.ts`, `panels/preview.ts` | **o comando de teste**: hoje "o projeto não tem comando próprio" (`projeto.ts:18`). Pode pedir mexer em `contract.ts`. Ler inteiro antes |
| **3** | **Na cena**: a motosserra de teste na mão, enquanto anima; a linha cinza na linha do tempo | `viewport/viewport-draw.ts`, `viewport/picking.ts`, a linha do tempo | o clique: a peça de teste **não** pode roubar o clique |
| **4** | **Ligar para cima**: o boneco no mecha, o mecha na nave. A cena em vários níveis, o mecha tocando a animação dele. Ciclo e profundidade recusados | `viewport-draw.ts`, `animations-actions.ts` (a âncora), `doc/montagem.ts` | a cena montada de hoje (rodada 8b); a âncora |
| **5** | **Pôr no projeto**, para baixo e para cima ("Este boneco"); `Ctrl+Z` volta a teste | `entities-actions.ts`, `drop-entity.ts`, `entity-around.ts` (só chamar) | o `minVersion` 1.1 do `around` |
| **6** | No cartão: **anima ▾**, **livre**, **skins ▾**, a mesma entidade duas vezes, **Trocar todas as iguais** | `entities-cards-model.ts`, `dopesheet-actions.ts` (só chamar), `image-picker-model.ts` (só chamar) | a faixa de hoje |
| **7** | Os casos difíceis: arquivo que falta, "sem lugar", 10×30 dobrado, a trilha de níveis. Medir nas 3 telas | os mesmos | a medição |

Cada lote: backup antes, o fecho da casa (regra 9), fotos em 1920 e 1280, e a conferência no uso por outra mão.

---

## 10. Perguntas para o Humberto

| # | Pergunta | Minha sugestão |
|:---:|:---|:---|
| 1 | A aba como **caixa dentro de caixa** (sem fio), com o projeto como um cartão? | **sim**. Fio cruza; caixa não. É o jeito do Photoshop (grupo dentro de grupo) |
| 2 | A peça de teste **na cena**: desenhada normal, com faixa no canto? Ou meio transparente? | **normal, com faixa**. Transparente não deixa julgar como fica |
| 3 | **"Pôr no projeto" para cima** (o boneco no mecha): o boneco passa a **levar o mecha** ("Este boneco"). Serve? Ou o mecha leva o boneco (aí se grava no arquivo do mecha, abrindo o mecha)? | **o boneco leva**, pelo "Este boneco": só escreve no arquivo aberto. Para o mecha levar o boneco: abrir o mecha e pôr o boneco nele, para baixo |
| 4 | A montagem de teste **volta** ao reabrir o projeto? | **sim**, como ficou. Ela não vai para o jogo |
| 5 | Uma montagem **por projeto**, ou uma **por animação**? | **por projeto**. "Na cena" liga e desliga |
| 6 | O mecha em volta: toca a animação dele **no relógio da agulha**? | **sim**. "parado" é a escolha que já vem |
| 7 | O botão "Aparecer na linha do tempo" cabe mal em 260 px. Escrever **"Na cena"**, com a frase inteira na dica? | **sim** |

---

## 11. O que eu não sei

| | |
|:---|:---|
| **O comando de teste** | a regra 6 quer `Command` com `apply` e `revert`. A montagem não é o `.bone`. Onde ele mora sem quebrar a lei do `contract.ts`: **o executor lê o contrato inteiro antes do lote 2**, e me diz |
| A âncora em vários níveis | a de hoje é um nível (`animations-actions.ts:291`). Compor 2 ou 3 parece direto; **não foi provado** |
| "livre" pela faixa | `setEntityAnimationAt` aceita `null` (`dopesheet-actions.ts:117`). Se isso apaga a escolha ou grava "nada": **a conferir** |
| O mecha com física | a física do de fora, no relógio da agulha, para trás e para frente: **não sei** se fica estável ao arrastar a agulha |
| Como o Spriter mostra a sub-entidade na tela | **sem fonte**: o manual 1.4 não tem o capítulo. O gesto do "Bake" tem fonte; o da sub-entidade, não |
| Como o DragonBones encaixa no editor | **sem fonte**: a documentação oficial está fora do ar |
| Nada disto foi visto no uso | tudo daqui saiu do código e da spec. O programa não foi aberto (régua da ficha) |

---

## Desvios

Escritos pelo executor da rodada 39 (`EXECUTANDO · rodada 39 — a aba das entidades [d86858]`), 06/10/2026.

| Lote | O plano dizia | O que foi feito | Por quê |
|:---:|:---|:---|:---|
| 1 | barra de cima com Na cena, Pôr no projeto e Mais | a barra nasce no lote 3, com um botão por função que já existe | botão que não faz nada é a regra 21 |
| 2 | o comando de teste: onde mora? | `SetMontagem` em `doc/montagem.ts`, dado pelo `run` do documento em foco; a regra escrita no `contract.ts` (Command, "o comando do projeto") | o `.bone` sai igual, letra por letra (provado) |
| 3 | o clique passa pela peça de teste | o clique vai ao que o ARQUIVO tem ali (a imagem de baixo); nada mudou no código do clique | a peça de teste nunca entra no esqueleto que o clique lê |
| 3 | a linha cinza na linha do tempo | aparece com os Detalhes abertos; fechada, fica abaixo da vista (só cabe uma faixa) | |
| 4 | ligar para cima: arrastar o projeto para a linha `piloto` do mecha | arrastar o cartão de fora até o mecha da PRATELEIRA, e uma janela pergunta o slot | o mecha não tem linhas na aba antes de entrar na montagem |
| 4 | a Visualização mostra a montagem inteira | a Prévia mostra só para baixo (as peças de teste no boneco), não o mecha em volta | fica para o lote 7 |
| 5 | numa animação, "Pôr no projeto" vale da agulha em diante | vai sempre para a base, como a grade | a grade faz assim, e o rodapé diz "(foi para a base)" |
| 5 | dois níveis para cima: "Pôr no projeto" leva só o primeiro, e o de mais fora fica teste | o de mais fora SAI, e o rodapé diz | ele ficaria pendurado em volta de um arquivo que não é o aberto, invisível na aba |
| 6 | "Testar skins" num cartão de entidade | **skins ▾** só nos cartões de TESTE (para baixo e em volta); a peça gravada no projeto não tem | a escolha de teste mora no manifesto; a do projeto mexeria no anexo do arquivo, e o plano só pede o teste |
| 6 | "livre — o jogo escolhe" na peça do projeto | grava a chave `nested/animation` = `null` na agulha (spec 7.11: nenhuma por cima; o jogo escolhe por código). Com a base aberta, o botão diz *"Abra uma animação"* | é a mesma conta do botão direito na faixa (`setEntityAnimationAt`); a dúvida do §11 fica decidida assim |
| 6 | "Trocar todas as iguais (N)", desligado | um botão no cartão de teste, que age uma vez ao clicar; os iguais são os slots com a mesma imagem (ou a mesma entidade) | a grade da rodada 9 tem o interruptor porque escolhe a cada clique; na aba, a peça já foi solta |
| 6 | "Outro canhão na mão_e: teste. São dois, separados." | *"Espada no slot head: teste. Agora há 2 cópias de espada, separadas."* | o nome da entidade não diz o gênero: "cópias" serve a todos |
| 6 | (doc 36, defeito 1) "o desenho fica igual ao do teste" | ao gravar para cima, a VISTA anda o que a âncora andava; o boneco volta à origem dele | o boneco não pode subir no arquivo sem mudar as chaves dele; o desenho é o mesmo, só deslocado. Provado: as peças ficam pixel a pixel no mesmo lugar |
| 6 | (doc 34, nota c) a aba comprida espreme as Animações | nada mudou | não era defeito: na foto, o grupo das Animações estava recolhido (▸). Medido nas 3 telas |
| 6 | (doc 34, nota d) "por trás e pela frente" | só anotado | o mecha das fotos é feito de três imagens do herói, sem nada por trás |
| 7 | "10 entidades, 30 slots": prateleira em grade de 6 | a prateleira continua em 2 por linha (260 px, miniatura com nome); a aba rola por dentro. Medido em 1280×720: nada passa de lado | 6 por linha não cabe na coluna com o nome legível |
| 7 | trilha "com mais de 4 níveis" | a trilha também aparece com 1 nível em volta, na tela baixa (até 800 px de altura) | é o desenho de 1280×720 do §2 |
| 7 | a trilha e o ▸ do cartão | sem porta no menu: são o jeito de olhar a aba, como rolar | não fazem nada no arquivo nem na montagem |
| 7 | "falta o arquivo" na palavra do canto | numa linha própria, embaixo do nome | na palavra, comia o nome em 260 px (visto na foto) |
