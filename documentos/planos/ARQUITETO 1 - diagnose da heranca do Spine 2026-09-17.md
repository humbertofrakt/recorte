# ARQUITETO 1 — Diagnose: onde o programa ainda é o Spine — 17/09/2026

Escrito pelo ARQUITETO (`animador-8b`), a pedido do Humberto, depois de ler
todo o material: `documentos/programa-novo/` inteiro, `AS REGRAS DA BASE`, as
quatro pesquisas, os planos de 13 a 17/09, o manual, a especificação, o
`contract.ts` e o código do editor e dos dois runtimes.

**Documento, não código.** Nada foi escrito em `editor/src`, `runtime/` ou
`formato/`.

O norte é o de `programa-novo/00`: **um Spriter com as ferramentas do Spine**,
reforma da v13.2, sem compatibilidade com arquivo antigo (M13). Tudo abaixo é
julgado contra ele.

---

## 1. A frase que resume

O Recorte tem três camadas. As duas de baixo foram **portadas do Spine**; a
de cima foi **pintada de Spriter**.

| Camada | O que é | De onde veio | Estado |
|:---|:---|:---|:---|
| **Formato** (`.bone`) | um esqueleto por arquivo, pose de repouso única, peles por slot, animação como lista de timelines por propriedade | modelo de dados do Spine 4.2, com correções (Apêndice A: *"porte fiel do Spine 4.2"*) | é a fundação. Boa, e é aqui que a reforma tem de começar |
| **Runtime** (TS e Python) | esqueleto montado **uma vez** ao carregar; `setToSetupPose` + `applyAnimation`; tracks e mix no `AnimationState` | porte do Spine 4.2 (skeleton, IK, transform, path, physics) | sólido, 53/53. Não sabe trocar de corpo nem nascer osso |
| **Editor** | cena, painéis, linha do tempo, gestos | os **gestos** são do Spriter (v3.6 → v13.2); o **modelo mental** continua o do Spine: `doc.animation === null` é o modo | é onde a herança mais aparece para o Humberto |

A única peça do formato que **não** é Spine é a chave `parent` (§9.4, semântica
do Spriter). Ela prova que dá para enxertar a lógica do Spriter no formato sem
quebrar nada, e é o molde do que vem.

---

## 2. As amarras, uma a uma

Cada linha diz **onde está**, **por que é Spine**, e **o que a visão manda**.
"Solta" = a visão já decidiu como fica. "Solta em parte" = decidiu o quê, não
o como. "Não fala" = a visão não tocou nisso.

### 2.1 No formato

| # | Amarra | Onde | Por que é Spine | A visão manda | Estado |
|:---:|:---|:---|:---|:---|:---|
| A1 | **Um esqueleto por arquivo** | §2.2, Apêndice A.1; `SkeletonData` | o Spine é um `.json` por personagem | P1: o projeto é a caixa; a caixa é o `.bonez` (§2.9). Zero campo novo para a caixa; **falta a regra de qual arquivo é corpo e qual é entidade** | solta em parte |
| A2 | **Pose de repouso única e anônima** | §5.1 *setup pose*; `Bone.setToSetupPose`, `doc.animation === null` | é o *Setup mode* do Spine | M1–M2: a base é uma animação com o quadro 0; uma pose por base; várias bases (corpos) por projeto | solta em parte: **falta como um arquivo diz "meu corpo é aquele" e como a animação troca de corpo** |
| A3 | **Esqueleto montado uma vez; osso não nasce nem morre** | `Skeleton` constructor (`runtime/src/skeleton.ts:707-745`); timelines resolvem osso por **índice** ao carregar (`BoneNumberTimelineData.bone: BoneData`) | o Spine monta o `Skeleton` do `SkeletonData` e nunca mais muda a lista de ossos | M11: o rabo **nasce** na virada (BASE §16). BASE §6 avisa: é a mudança mais funda que a runtime já teve | solta em parte: **falta o desenho da virada no runtime** |
| A4 | **Pele `default` sempre ativa, por baixo; "a última adicionada ganha"** | §2.2, §4.4, §7.1; `Skeleton.rebuildSkinLookup`; `canDeleteSkin` | é exatamente o *default skin* do Spine | F19 (a `default` sai do fundo fixo) e F22 (a de CIMA da pilha vence) | solta: **é texto de spec + a coluna Ativas**. O runtime já aplica na ordem da lista |
| A5 | **Pele externa não traz osso** | §2.8: *"bones, slots, constraints do arquivo externo são ignorados"* | no Spine uma skin nunca sai do esqueleto | F23: a pele de fora traz osso próprio (o rabo do Dota) | solta em parte: **falta a regra de composição** |
| A6 | **Slot preso a um osso fixo; não há timeline `slot/bone`** | §4.3, §9.5; `reparent.ts:788` (*"o desenho muda de osso na Montagem: a chave de pai é só de osso"*) | no Spine o slot nunca troca de osso | F8/G10: o desenho troca de osso por chave, como no Spriter. Campo novo **aprovado** | solta em parte: **falta a forma da chave** (ver ARQUITETO 3) |
| A7 | **Pesos são da pose de repouso, não animam** | §7.4; `mesh-doc.ts` (*"peso é sempre da forma de repouso, animando ou não"*) | no Spine só o `deform` anima | F9: pesos animáveis, **confirmado** | solta em parte: falta a timeline |
| A8 | **Encaixe por nome de osso (`socket`)** | §7.9 `point.socket`, §7.11 `socket`/`childSocket`; Apêndice A 62; exemplos `mecha.bone`, `espada.bone`, `capacete.bone`, `mecha-pele-inverno.bone`; casos pendentes C-271, C-272, C-278 | não é Spine: é proposta do Diretor (09/09) que o Humberto **derrubou** em 15/09 (*"não se guarda a mão direita nas costas"*) | F7: **o socket sai**; a entidade segue a imagem (E5) | solta: tirar da spec, refazer os 4 exemplos, apagar 3 casos pendentes |
| A9 | **Física guarda estado entre quadros** | §5.1, §6.5 (*"este estado atravessa a função Pose"*); C-260 | porte do `PhysicsConstraint` do Spine 4.2 | R1 diz: o quadro é função pura do tempo. A física é a **única** coisa do formato que não é. `COMO SE FAZ EFEITO` §4 avisa: *"não serve de modelo para partícula"* | **não fala** de frente. Ver §4 abaixo |
| A10 | **Mistura por tracks é do runtime, não do arquivo** | §1.4; `AnimationState` (*"NOTHING here adds a field to the format"*) | modelo de tracks do Spine | Q42 (animação por cima da de fora) pediria uma track **no arquivo**. Aberta, não trava | não fala |
| A11 | **A primeira animação da lista é a padrão** | §4.6, Apêndice A 67 | decisão do Humberto (10/09), não Spine | com M8 (cada corpo tem as suas) continua valendo por corpo | solta |
| A12 | **Vocabulário do JSON**: `slot`, `attachment`, `skin`, `setup` | todo o formato | nomes do Spine | a tela já traduz (desenho, pele, pose de repouso). **Mudar as chaves do JSON não compra nada para quem usa** | não mexer |

### 2.2 No runtime (TS e Python)

| # | Amarra | Onde | O que a visão pede |
|:---:|:---|:---|:---|
| R1 | `Skeleton` = um `SkeletonData`; `bones[]` fixo; timelines apontam para `BoneData` por índice | `skeleton.ts`, `data.ts`, `loader.ts loadBones` | virada = trocar de `Skeleton` no meio da animação; timelines por **nome**, aplicadas ao corpo do instante |
| R2 | `applyAnimation(skeleton, animation, t)` recebe UMA animação de UM esqueleto | `animation.ts:162` | a animação de um corpo pode dirigir outro corpo depois da virada |
| R3 | `nested.ts`: o filho é sempre do pai; o relógio deriva do tempo do pai (bom: é puro) | `runtime/src/nested.ts` | fica. É a **entidade** (imagem com relógio). `origin`/`timeScale` já existem |
| R4 | Runtime Python **não** faz esqueleto aninhado nem `nested` | `runtime-python/README.md`, "O que não cobre" | a entidade é o coração da visão: o Python tem de alcançar antes de a 1.0 fechar, senão a conformidade não prova nada de entidade |
| R5 | `AnimationState`: tracks, mix, `defaultMix` | `animation-state.ts` | fica como ferramenta do jogo e da Prévia. Não é amarra |
| R6 | Física: `physicsApply` com estado por instância | `constraints/physics.ts` | ver §4 |

### 2.3 No editor

O editor é onde a herança **pesa na mão** do Humberto. A régua `doc.animation === null`
está em **134 lugares, 43 arquivos** (contagem de hoje; a `AVALIACAO o modo montar`
contou 124 em 39 em 14/09).

| # | Amarra | Onde | Quantos | A visão manda |
|:---:|:---|:---|:---:|:---|
| E1 | **O modo mora no documento**: `doc.animation === null` = Montagem | `anim/pose-mode.ts` (a regra), `contract.ts` (`EditorMode`), 41 arquivos mais | 134 | M4: o modo Montar sai como lugar. **A base aberta continua sendo um estado** (é o quadro 0 do corpo); o que sai é o freio e o esconderijo |
| E2 | **"Gravar sozinho" desligado RECUSA** (`'bloqueado'`) | `pose-mode.ts:253, 288, 317`; `mesh-doc.ts:399`; `draw-order-model.ts:717` | 5 saídas | M6: editar sempre grava. Key all / Key selected como botões extras |
| E3 | **O interruptor `Montagem \| Animando`** e `Ctrl+Tab` | `ui/action-bar-model.ts` `MODE_ITEM`, `MODE_SIDES`; `viewport-toolbar.ts buildModeSwitch/syncModeSwitch`; `ui/shell.ts:2213` (rodapé); `animations-actions.ts toggleMode`; `keys.ts` | 6 arquivos | M4: sai da barra |
| E4 | **Ferramentas somem por modo** (`Tool.modes`, `toolsForMode`, `syncToolModes`, `toolWrongMode`) | `contract.ts:262-270`; `toolbar-model.ts`; `tools/registry.ts:130-137`; `mesh-tool.ts:126`, `weights-tool.ts` | 5 arquivos | M4: *"tudo sempre disponível"* |
| E5 | **O tocador apaga em Montagem** | `dopesheet-player.ts:522-535`; `dopesheet.ts:810-814` | 2 | M5: o tocador nunca apaga; a base mostra o quadro 0 |
| E6 | **O semáforo do Chavear** (verde/vermelho/cinza) | `pose-mode.ts keyButtonState/keyButtonHint`; `dopesheet-player.ts:500-510` | 2 | G13: sai (palavra dele, 17/09) |
| E7 | **Recados "é da Montagem"** | `create-bone.ts:39, 437, 469`; `mesh-tool.ts:151-196`; `reparent.ts:662, 788-798` | 3 arquivos | M7: a mexida vai para a base **daquela animação**, e a tela diz onde foi |
| E8 | **Um `BoneFile` por documento** (`Doc.file`); `nestedSkeletons` é um mapa passivo só para desenhar | `doc/document.ts`; `io/open-save.ts:298-314` | — | P1–P3, E3, E17: o documento é um **projeto** com N corpos e N entidades; abrir outro `.bone` traz como corpo ou como entidade |
| E9 | **A Árvore, a Ordem e as Propriedades leem `file.bones`/`file.slots`** (o arquivo), com a exceção `appliedParents` (v12.8) | `tree-rows.ts`, `draw-order-model.ts`, `properties-model.ts` | — | M12: mostram **o corpo do instante** |
| E10 | **`visibleSkins[0]` é a pele do lápis**; `default` nunca desliga | `contract.ts` (`visibleSkins`), `skins-model.ts skinForRequired/canDeleteSkin`, `onion.ts skinChoices` | — | I7/I7d: Feitas/Ativas; o lápis é separado da pilha; a `default` sai do fundo fixo |
| E11 | **O lápis só vale para desenho** | `skins-model.ts` (só `skinForRequired` ajuda); teste ao vivo 16/09 | — | I5: um lápis só para osso, desenho e regra, com sinal visual |
| E12 | **Grade do botão direito só lista imagens** | `panels/image-picker.ts`, `image-grid-model.ts` | — | E6: lista entidades também |
| E13 | **Sem faixa de entidade na folha** | `panels/dopesheet*.ts` (nenhuma linha `nested`) | — | E12b, E13, E14 |
| E14 | **Shift soma à seleção de chaves; Ctrl clona** | `dopesheet-pointer.ts:61-67` | — | G2: Ctrl + clique soma; Ctrl + arrastar continua clonando |
| E15 | **N cria osso, B posa** | `ui/keys.ts:127-128` | — | G1: B cria osso, Posar → Y, N livre |
| E16 | **Teclas fixas** | `ui/keys.ts` (tabela, sem remapear) | — | G7: trocar as teclas |
| E17 | **Copiar a ordem apaga a linha e grava em 0** | `draw-order-model.ts:802-819` | — | G3: chave a chave, como o Spriter |

### 2.4 Nas provas, exemplos e testes

| # | O quê | Onde | O que muda |
|:---:|:---|:---|:---|
| P1 | Roteiro dos 30 minutos fala em *"cena vazia, Montagem"* e *"abre em Animando"* | `ferramentas/provas/roteiro-30.mjs`, passos 1 e 9 | vira *"corpo vazio, base aberta"* e *"abre a animação"* |
| P2 | Testes que provam a recusa e o modo | `editor/testes/*` (os 29 do manual pausado, `animando`, `chaves`, `malha`, `ferramentas`, `menus`) | reescritos, nunca apagados. A contagem não cai (regra 9) |
| P3 | Exemplos com socket | `formato/exemplos/mecha*.bone`, `espada.bone`, `capacete.bone` | refeitos pela imagem (F7) |
| P4 | Casos pendentes C-270 a C-279 | `conformidade/casos-pendentes/` | C-271, C-272, C-278 (socket) saem; os outros sete são refeitos sem `socket` e entram com a entidade |
| P5 | `dois-runtimes.md`, `como-provar-conformidade.md` | `conformidade/` | ganham a virada e a entidade |

---

## 3. O que já é Spriter e fica (não refazer)

Conferido no código, não só nos documentos.

| O quê | Onde | Prova |
|:---|:---|:---|
| Chave `parent` no meio da animação, com conversão das chaves seguintes | `reparent.ts runReparent` (caminho 2), C-281/282/286 | v12.6, v12.8 |
| Criar osso, ponto, caixa, imagem **no meio da animação** | `Tool.modes` sem `create-bone`, `point`, `box`; `appearKeys` | v8.3 (lote 57) |
| O começo se guarda sozinho (`keepStartKey`) | `keying.ts` | v9.9 |
| Copiar o membro; colar espelhado; Ctrl clona; empurrar; limpar repetidas | `dopesheet-edit.ts`, `timeline-tools.ts` | v12.6–v13.2 |
| Abrir pasta, paleta por subpasta, arrastar monta, atlas nasce ao salvar | `io/project-folder.ts`, `io/folder-save.ts` | v8.9–v9.4 |
| Pivô por região do atlas; o rig é a fonte da verdade | `io/pivot-model.ts`, §10.3 | v8.0–v8.4 |
| Grade de imagens no botão direito, por pasta | `image-picker.ts`, `image-grid-model.ts` | v9.7, v10.0 |
| Árvore única (osso → desenhos → filhos), Ordem como Z-Order | `tree-rows.ts`, `draw-order*.ts` | v10.2, v10.3 |
| Transformar como ferramenta única; caixa gira com o objeto | `transform-tool.ts`, `transform-box.ts` | v7.8, v12.0 |
| O `P` pega filhos (o `B` do Spriter) | `parent-gesture.ts` | v5.6, v9.6, v12.1 |
| Painéis: recolher, arrastar, fechar, flutuar; arranjo na máquina | `ui/panel-groups.ts`, `layout-model.ts` | v12.2–v12.5 |
| Malha e pesos valem nos dois modos; só arrastar vértice grava chave | `mesh-doc.ts` | v12.6 |
| Peso pintado como no Spine/DragonBones (Ligar, cor por osso, pizza) | `weights-tool.ts`, `mesh-panel-model.ts` | v11.6–v11.7 |
| Esqueleto aninhado desenhado na cena e na miniatura | `viewport.ts`, `thumbnail-kind.ts`, `nested.ts` | v3.x |

---

## 4. Os dois achados que a visão ainda não olhou de frente

### 4.1 A física quebra a régua R1 — e ninguém decidiu o que fazer

R1 (`programa-novo/01`): *"o quadro é função pura do tempo; nada guardado
entre quadros."* A `physics` (§6.5) guarda `xOffset`, `xVelocity`,
`remaining`, `lastTime` entre quadros. Arrastar a linha do tempo para trás
**não** devolve o mesmo cabelo. Hoje a suíte só consegue provar a física
porque a sonda anda de `physicsDt` em `physicsDt` desde `t = 0` (§12.4).

| Saída | O que custa | O que ganha |
|:---|:---|:---|
| **a** — Deixar como está, e escrever na spec que a física é a única simulação; o editor oferece **assar em chaves** (D6, Q28 *"provavelmente sim"*) | nada agora; a porta do bake é lote de editor | honestidade: a régua diz onde ela não vale |
| **b** — Definir a física como "simular de 0 até `t` com passo fixo" — determinística, mas custo O(t) ao arrastar para trás | texto de spec; o editor já faz isso ao reposicionar? **Não confirmei** (`document.ts reposeQuiet` chama `updateWorldTransform(currentTime)` sem rebobinar) | função de `t`, só que cara |
| **c** — Tirar a física do núcleo para extensão `BONE_physics` | quebra 3 casos de conformidade e o `heroi.bone`; M13 permite | a régua fica inteira no núcleo |

**Recomendo a.** É o menor custo, e o bake já estava pedido. Decisão dele,
porque toca o núcleo (regra 7). Vai para a lista de perguntas do ARQUITETO 3.

### 4.2 "Várias bases por corpo" ou "vários corpos, cada um a sua base"?

O `10` F1 escreve *"várias bases por corpo"*. O `02` M1–M2 e a BASE §8–§12
descrevem outra coisa: **cada corpo (homem, lobisomem, mecha) é uma base**, e
cada corpo tem as suas animações. A tela do Humberto (*"Corpos em cima,
Animações embaixo"*) é a dos corpos.

Leitura do ARQUITETO, e é a que a spec do ARQUITETO 3 usa: **base = a pose
de repouso de um corpo, vista na janela Animação como a entrada de quadro 0
daquele corpo.** Um corpo tem uma base. Um projeto tem vários corpos. Uma
animação nasce num corpo e pode colar outro corpo no meio (a virada).

Se ele quis dizer outra coisa (o mesmo esqueleto com duas poses de repouso
nomeadas), a spec muda num ponto só — a virada passaria a trocar **pose**, não
**corpo** — e o rabo do lobisomem não nasceria. Como o rabo nasce (BASE §16),
fico com a leitura acima. **Pergunta a confirmar com ele**, marcada no
ARQUITETO 3.

---

## 7. O que os documentos antigos acrescentam à diagnose

Lidos por inteiro: `HISTORICO.md`, as dez notas de desenvolvimento, os doze
planos de 08 a 11/09, a pesquisa antiga de menus e os dois inventários
"todas as funções" (Spriter e Spine).

### 7.1 A herança mais pesada não está na tela: está no runtime

| O quê | Onde está escrito |
|:---|:---|
| *"O runtime TypeScript é porte do Spine 4.2"*, palavra por palavra | `HISTORICO.md:598, 643`; `PEDIDOS-FASE6.md:20` |
| O Python **não** é independente do Spine: copiou o pseudocódigo da spec, que é o do Spine | `HISTORICO.md:643` |
| §5.5 (`appliedFromWorld`) é aproximado sob cisalhamento (6% com `shearX 20°`); o editor já tem uma conta própria e exata (`localFromWorld`) que **diverge** da spec | `DUVIDAS-SPEC.md:50-63`, `PEDIDOS-FASE6.md:137-186` |
| A rotação do atlas é o **contrário** do Spine (o importador espelha) | `DUVIDAS-SPEC.md:32-48` |
| §12.4 manda **conferir as fórmulas contra o `spine-runtimes` C++** antes de congelar a 1.0 | `HISTORICO.md:716` |

**Isto não é amarra a soltar.** IK, transform, path e as fórmulas de mundo são
a **ferramenta** do Spine que a régua R3 manda encaixar. Ficam. O que a visão
não diz, e o ARQUITETO 3 §13 passa a dizer, é **o que acontece com as
decisões abertas do Apêndice B quando a spec vira 0.2** (ver 7.3).

### 7.2 O que o Spriter fazia, o Spine barrou, e ainda está aberto

Dos dezesseis casos em que um plano antigo citou o Spriter e a saída ficou
presa ao Spine, treze foram destravados entre 09 e 14/09. **Sobram três:**

| # | O que o Spriter faz | O que ficou | Onde | O ARQUITETO diz |
|:---:|:---|:---|:---|:---|
| S1 | **Ponto (action point) com chave própria**: posição e ângulo por quadro | §9.1: *"ponto não tem timeline nenhuma"* (é o modelo do Spine: quem anima é o osso). Ele disse *"vejo depois"* (D4, 10/09) | `PLANO rodada 4:205, 388`; `PENDENCIAS:30` | vai para a triagem (ARQUITETO 2) como **DESCARTA por ora**: um osso resolve; reabre se ele pedir |
| S2 | **Malha e pesos no meio da animação** | v12.6 tirou a expulsão; *"gerar malha no meio: não confirmei"* | `programa-novo/05:38` | M7 resolve por definição (vai para a base do corpo do instante). **Testar ao vivo** no degrau 5 |
| S3 | **Som na linha do tempo**, com a onda e a prévia | `PLANO pasta do projeto:197` diz *"o formato não tem áudio"* — **mas §8.6 tem** (evento com `audio`, `volume`, `balance`) | contradição em aberto | é **PORTA** (D5): o formato já tem; a tela não |

### 7.3 O que a visão nova não tratou e a spec 0.2 vai esbarrar

| # | Pendência antiga | Onde | Por que dói no degrau 1 |
|:---:|:---|:---|:---|
| P1 | **As 8 decisões do Apêndice B que travam a 1.0**: heranças (fechada), `BONE_param_grid`, pêndulo, CCD/FABRIK, domínio, conferir contra o C++, limiares do binário, campos 4.3 do Spine | `HISTORICO.md:708-720`; spec Apêndice B | quem reescreve a spec precisa dizer, para cada uma: fecha, adia ou vira extensão. Q24 fechou só a IK |
| P2 | **`"version": "0.9"` enquanto o rascunho está aberto** (decisão 10) | `HISTORICO.md:720` | M13 (sem compatibilidade) muda a conversa: o rascunho passa a **0.2**, e é escrito no CHANGELOG |
| P3 | **As 29 dúvidas do `DUVIDAS-SPEC.md`** com resposta escolhida, esperando confirmação | `HISTORICO.md:723` | continuam. Não travam; ficam listadas |
| P4 | **Os 10 casos pendentes C-270 a C-279** e a decisão 16 (mistura em duas camadas do filho) | `HISTORICO.md:540, 726` | o socket sai (F7): três casos morrem, sete são refeitos. **A decisão 16 fecha como normativa** — a entidade depende do `baseAnimation` (ARQUITETO 3 §4.2) |
| P5 | **`assets.skins` × `skin.uri`** e **`EXTERNAL_CHAIN`** (Apêndice B 11, 12) | `HISTORICO.md:727-728` | I12 reusa `assets.skins`: fecha como está |
| P6 | **Bolo ou glacê**: linha de comando, glTF, importadores | `PENDENCIAS:76-84` | o importador do Spriter **vira bolo** com F8 (`object_ref.parent` sem assar) e com o projeto-caixa (SCML = projeto) |
| P7 | O validador de linha de comando **não abre `.bonez`** | `PLANO rodada 4:269` | com o projeto = `.bonez`, isso deixa de ser detalhe |
| P8 | Suíte sem caso para `tag`, `variable`, `parameter`, `driver`, aninhado, `darkColor`, `blend`; `t mod duration` adivinhado no Python | `HISTORICO.md:666-670`; `SPEC-INSUFICIENTE.md:141-148` | a entidade e a virada põem o aninhado na suíte de qualquer jeito |

### 7.4 As decisões antigas que a visão reverte — e estão escritas nos dois lados

Dezesseis, todas com a citação antiga e a nova (ver o relatório de leitura
que alimentou esta seção). As que mais mexem em código: o interruptor de modo
(v4.6) · a pose de repouso única · o `'bloqueado'` (v1.x) · o semáforo (v1.x)
· o socket (v3.1–v3.5) · `P`/`N` · Shift na seleção de chaves · a `default`
por baixo · o olho das peles (v5.0) · *"um esqueleto por arquivo é o que o
glTF e o Spine fazem"* (D6, 10/09) · *"vai para o repouso"* (14/09) · teclas
fixas.

---

## 8. Contagem, para o Planejador dimensionar

| O quê | Número |
|:---|---:|
| Lugares com `doc.animation === null` e variantes no editor | 134 em 43 arquivos |
| Arquivos do editor que citam o Spine em comentário | 40 (a maioria é "como o Spine faz", inofensivo) |
| Menções a `socket` na spec | 40 linhas |
| Exemplos a refazer | 4 |
| Casos pendentes a apagar / refazer | 3 / 7 |
| Testes hoje | 2.839 (2.810 passam, 29 pulados) |
| Casos de conformidade hoje | 53, nos dois runtimes |
| Linhas do runtime TS / Python | 7.827 / 4.779 |
| Linhas do editor | 60.412 |

---

## 9. Onde este documento se encaixa

| Documento | O que tem |
|:---|:---|
| **ARQUITETO 1** (este) | a diagnose: o que é Spine e precisa ser destravado |
| `ARQUITETO 2 - triagem do que veio do Spine e dos outros 2026-09-17.md` | item por item: traduz, só porta, descarta |
| `ARQUITETO 3 - spec da atualizacao 2026-09-17.md` | o modelo novo escrito: projeto, corpo, virada, entidade, pele, as chaves novas |
| `ARQUITETO 4 - tarefas ordenadas 2026-09-17.md` | a obra, degrau por degrau, em cima do `13` do Planejador |
