# ARQUITETO 4 — As tarefas, na ordem — 17/09/2026

Escrito pelo ARQUITETO (`animador-8b`). **Documento, não código.** É a obra
do ARQUITETO 3, cortada em degraus com dependência escrita, em cima do `13`
do Planejador. Onde este documento e o `13` discordam, vale este, e a linha
diz por quê.

**Reforma da v13.2, não recomeço** (🗣️ 17/09). Cada tarefa diz o que já
existe e o que muda. Partes pelo `documentos/PARTES.md`. Fecho pelo
`CLAUDE.md` (regras 9, 14, 15). **A contagem de testes nunca cai: teste que
prova o modo antigo é reescrito para provar o novo, nunca apagado.**

**Código congelado até o Humberto dizer "pode programar."** O degrau 0 é só
texto e pode começar hoje.

---

## O mapa

```
D0 texto ──► D1 formato+provas ──┬──► D2 runtime TS ──┐
                                 └──► D3 runtime Py ──┤
D4a editor sem freio (paralelo a D2/D3) ─────────────┼──► D4b projeto e virada ──► D5 janela Animação
                                                     │                         ├──► D6 linha do tempo
                                                     │                         ├──► D7 cena·árvore·malha
                                                     │                         ├──► D8 imagens·ordem·entidades
                                                     │                         ├──► D9 peles
                                                     │                         └──► D10 arquivo
                                                     └──────────── D11 casca (M4 só com D4–D7 prontos e ele vendo)
                                                                   D12 glacê · D13 manual
```

**Três chats por rodada** (régua do `MAPA da próxima rodada`). As rodadas que
podem andar juntas: `D2 ∥ D3 ∥ D4a` · depois `D5 ∥ D6 ∥ D7` · depois
`D8 ∥ D9 ∥ D10`.

---

## D0 — Decidir no texto (agora, com o código congelado)

**Quem:** Arquiteto e Planejador; as respostas são do Humberto.
**Custo:** 1 lote de texto.

| # | Tarefa | Onde | Pronto quando |
|:---:|:---|:---|:---|
| 0.1 | O Humberto responde **A1–A8** do ARQUITETO 3 §15 (ou confirma as suposições) | `programa-novo/12` ganha A1–A8 como Q43–Q50; as respostas entram no ARQUITETO 3 | cada uma com 🗣️ ou "suposição mantida" |
| 0.2 | **Reescrever a spec como rascunho 0.2**: a lista de §13 do ARQUITETO 3, seção por seção | `formato/ESPECIFICACAO 2026-09-17.md` (nova, com data; a 06/09 vai para `backup/` com linha no `INDICE.md`) | texto lido pelo Humberto; o Apêndice A ganha 72–79; o Apêndice B diz, para cada aberta, **fecha / adia / vira extensão** |
| 0.3 | O **glossário** PT ↔ JSON (ARQUITETO 3 §0) entra na spec, §1.6 | idem | — |
| 0.4 | Os `esperado.json` dos casos **C-290 a C-297** calculados **à mão**, por dois scripts independentes, como a Pesquisa 1 fez para P-001 | `conformidade/casos-pendentes/` | as contas escritas no `leiame.md` de cada caso |
| 0.5 | Os quatro exemplos **refeitos sem socket** + `lobisomem-rabo.bone` (pele de fora com osso) + `humanoide-v1.bone` (a convenção) | `formato/exemplos/`, `formato/rigs/` | `npm run validar -- --todos` verde **com o schema novo** (0.2 → só depois de D1) |
| 0.6 | `CHANGELOG.md`: a nota *"o rascunho 0.2 não abre arquivo do 0.1; ninguém lê ainda (M13)"* | raiz | — |

---

## D1 — Formato e provas (`formato/`, `conformidade/`, `ferramentas/validador`, `site/validador`)

**Depende de:** D0. **Parte:** Formato e runtime. **Custo:** 2 lotes.

| # | Tarefa | Já existe | Muda |
|:---:|:---|:---|:---|
| 1.1 | `bone.schema.json` | tudo do 0.1 | entram `body`, `slot/bone` (+`offset`), `weights`, `animation.crop`, `rig.reference`; saem `socket`, `childSocket`, `rig.sockets`; `default` sem regra especial |
| 1.2 | Validador CLI e web | `validar.mjs`, `site/validador/nucleo.js` | códigos novos: `BODY_UNMET`, `BODY_AT_START`, `EXTERNAL_BONE_NOT_SKIN`; a exceção "nome existe num corpo citado por `body`"; **o CLI passa a abrir `.bonez`** (P7 do ARQUITETO 1 §7.3) |
| 1.3 | Casos pendentes | C-270 a C-279 | apagar C-271, C-272, C-278; refazer os sete sem socket; entram C-290 a C-297 (D0.4). Todos em `casos-pendentes/` até os **dois** runtimes passarem |
| 1.4 | `dois-runtimes.md`, `como-provar-conformidade.md`, `REGISTRY.md` | — | a virada, a entidade, a pilha, o `body` no dump |

**Pronto quando:** `npm run validar -- --todos` verde; os 53 casos de hoje
continuam 53/53 (o que muda de esperado é A-025/A-026 pela pilha — com o
`--gerar` **conferido à mão**, nunca cego).

---

## D2 — Runtime TypeScript (`runtime/src`)

**Depende de:** D1. **Parte:** Formato e runtime. **Custo:** 3 lotes.

| # | Tarefa | Já existe | Muda |
|:---:|:---|:---|:---|
| 2.1 | **Pilha de peles** (F19, F22) | `setSkin`, `rebuildSkinLookup` | sem `defaultSkin` implícito; `Skeleton` nasce com `[default]`; A-025/026 |
| 2.2 | **`Actor`** e a **virada** (`body`) | `Skeleton`, `applyAnimation`, `nested.ts` | `Actor { esqueletos, arquivo }`; `pose(actor, anim, t)` com `corpoEm`; casamento por nome com cache por (animação, corpo); `AnimationState.apply(actor)`; `CanvasRenderer` desenha o actor; `loadProject(bonez)` monta um `Skeleton` por corpo citado. **Nenhum esqueleto remontado no meio** |
| 2.3 | **`slot/bone`** com `offset` (F8) | `Slot.bone` fixo | `Slot.bone` aplicado + `Slot.offset`; `setToSetupPose` devolve o do arquivo; `computeWorldVertices` de `region` e malha sem `binding` multiplicam o `offset` |
| 2.4 | **`weights`** (F9) | `deform` por slot | override de pesos por slot, mesmo caminho do `deform` |
| 2.5 | **Pele de fora com osso** (F23) | `assets.skins` ignora `bones` | composição ao carregar: `bones`/`slots`/`constraints` `skinRequired` entram; colisão → local vence |
| 2.6 | **`rig.reference`** (F24) | `assets.animations` copia timelines | `k` multiplica `x`/`y` de osso ao copiar |
| 2.7 | **Socket sai** (F7) | `attachments/skeleton-attachment.ts`, `point.ts`, `nested.ts` `computeParentMatrix` | só o caso simples |
| 2.8 | **Dump** (§12.4) | `pose-dump.ts` | campo `body`; canais do corpo do instante |
| 2.9 | **Aviso de auto-interseção** da `clipping` (L2, §7.7) | nada | `loader.ts` |
| 2.10 | `animation.crop` só passa pelo loader | — | lido, guardado, não usado |

**Pronto quando:** 53 + C-290…C-297 + os sete refeitos = **68 casos** verdes
no TS; `runtime/testes` sem queda.

---

## D3 — Runtime Python (`runtime-python/`)

**Depende de:** D1. Pode andar **em paralelo** com D2, **só pelo texto da
spec**, como sempre foi. **Custo:** 3 lotes (o Python está atrás: não faz §7.11).

| # | Tarefa |
|:---:|:---|
| 3.1 | **§7.11 aninhado e timelines `nested`** — o que falta desde a fase 7. Sem isso a entidade não tem prova dupla |
| 3.2 | O mesmo de 2.1 a 2.8 |
| 3.3 | `npm run conformidade:dois` — o confronto campo a campo dos dois, inclusive `body` |

**Pronto quando:** 68/68 no Python; os casos saem de `casos-pendentes/` para
`casos/` **no mesmo lote** em que os dois ficam verdes (§12.8).

---

## D4a — O editor sem freio (paralelo a D2/D3)

**Não depende do runtime novo.** É tirar o que recusa e esconde, mantendo
`doc.animation === null` como **base aberta**. **Parte:** Casca, Linha do
tempo, Cena (três chats ou um, em série). **Custo:** 2 lotes.

| # | Tarefa | Onde hoje | Muda |
|:---:|:---|:---|:---|
| 4a.1 | **Editar sempre grava** (M6) | `pose-mode.ts` `autoKey`, `'bloqueado'`; `mesh-doc.ts:399`; `draw-order-model.ts:717`; `image-picker.ts:82` | `autoKey` sai; `setPropertyOrKey` tem dois caminhos; `PoseOutcome` perde `'bloqueado'`; trocar imagem grava chave (Q9) |
| 4a.2 | **Key all / Key selected** (M6) | Chavear (`K`), Chavear tudo (`Ctrl+K`) já existem | ganham a dica *"protege a pose"*; o botão **Gravar sozinho** e a tecla `A` saem (`keys.ts`, `menus.ts`, `dopesheet-player.ts`) |
| 4a.3 | **Semáforo sai** (G13) | `keyButtonState`, `keyButtonHint`; CSS `dope-chavear-*` | fora |
| 4a.4 | **Nenhuma ferramenta some** (M4 metade) | `Tool.modes`, `toolsForMode`, `syncToolModes`, `toolWrongMode`, `toolForKey` por modo; `mesh-tool.ts:151-196`; `weights-tool.ts` | `modes` sai do contrato; Malha e Pesos valem sempre (a forma vai para a base — M7 em D7) |
| 4a.5 | **O tocador nunca apaga** (M5) | `dopesheet-player.ts:522-535`, `dopesheet.ts:810` | com a base aberta: `0,00 s`, um losango, botões de tocar cinza **com dica** |
| 4a.6 | **Recados "é da Montagem"** | `create-bone.ts:437, 469`; `reparent.ts:662, 798`; `mesh-doc.ts` | somem ou viram "foi para a base" (o destino certo vem em D7) |
| 4a.7 | **Roteiro** passos 1 e 9 | `ferramentas/provas/roteiro-30.mjs` | *"corpo vazio, base aberta"*; *"abre a animação"* |
| 4a.8 | Testes | `animando`, `chaves`, `malha`, `ferramentas`, `menus`, `teclas`, `acoes`, os 29 do manual pausado | reescritos para o novo; contagem não cai |

**O interruptor `Montagem | Animando` fica** até D11 — 🗣️ *"só com ele vendo"*
(`AVALIACAO DO DIRETOR` §6). Aqui ele passa a chamar-se **Base | Animação** na
dica, sem mudar de lugar.

**Pronto quando:** roteiro 14/14; mexer com "Gravar" que não existe mais
grava chave; N cria osso em qualquer estado; a Malha existe com animação
aberta e escreve na pose de repouso dizendo isso.

---

## D4b — O documento vira projeto; a virada na tela

**Depende de:** D2 (Actor), D4a. **Parte:** Arquivo + Casca (arquivo de
passagem `contract.ts`, `main.ts`). **Custo:** 3 lotes. **É o degrau mais
fundo do editor.**

| # | Tarefa | Onde hoje | Muda |
|:---:|:---|:---|:---|
| 4b.1 | **`Projeto`** | `Doc { file }` | `Projeto { corpos: Map<uri, Doc>, entidades, emFoco, manifesto }`; uma pilha de desfazer; `Command` continua por `Doc` |
| 4b.2 | `RECORTE_projeto` no `manifest.extras` | `RECORTE_editor_state` | as listas Corpos/Entidades e `emFoco` |
| 4b.3 | **`corpoEm(t)`** e `esqueletoEm(t)` | `doc.skeleton`, `appliedParents` | o `Actor` do runtime posto na cena; a Árvore, a Ordem e as Propriedades leem o corpo do instante (M12) |
| 4b.4 | Abrir pasta com `manifest.json` (saída a de §1.3) | `io/project-folder.ts`, `io/folder-save.ts`, `open-save.ts` | um `.bone` por corpo e por entidade ao lado; um atlas |
| 4b.5 | **Colar corpo aqui** (a virada, M10) | nada | comando: grava a chave `body` em `t`; a cena, a Árvore, a Ordem e as Propriedades trocam de corpo dali em diante |
| 4b.6 | M7: **mexida estrutural vai para a base do corpo do instante** | `create-bone`, `mesh-doc`, pivô, `Reparent` caminho 3 | escreve no `Doc` do corpo de `t`; rodapé *"foi para a base do lobisomem"* |
| 4b.7 | Testes | `documento`, `arquivo`, `arvore`, `ordem`, `paineis` | — |

**Pronto quando:** abrir o `heroi` como projeto de um corpo funciona como
hoje; um projeto de dois corpos abre; a animação `transformar` com a chave
`body` em `0,5` mostra o lobisomem dali em diante, e a Árvore mostra o rabo
só depois da virada.

---

## D5 — A janela Animação (M8, M9, E1–E3, E15, E16)

**Depende de:** D4b. **Parte:** Animações + Imagens e pasta. **Custo:** 2 lotes.

| # | Tarefa |
|:---:|:---|
| 5.1 | Lista **Corpos** em cima; **Animações do corpo** embaixo (`animations.ts`, `animations-model.ts`). Clicar no corpo sem animação abre a **base** |
| 5.2 | **Salvar como base nova** (M9): corpo novo com a pose de `t` como setup |
| 5.3 | **Promover / rebaixar** entidade ↔ corpo (E2, E3): move de lista; abrir a entidade mostra as bases e animações dela |
| 5.4 | Painel **Entidades** ao lado do Imagens (E15), miniatura **parada** (E16) — de onde se arrasta |
| 5.5 | Testes em `animando`, `previa`, `pasta-do-projeto` |

---

## D6 — A linha do tempo (M6 pronto em D4a; G2, G3, G11, G12, E12b, E13, E14, F8, F9 na folha)

**Depende de:** D2, D4b. **Parte:** Linha do tempo. **Custo:** 3 lotes.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 6.1 | **Ctrl + clique** soma; **Ctrl + arrastar** clona; Shift sai da seleção (G2) | `dopesheet-pointer.ts:61-67` |
| 6.2 | Arrastar uma chave **move só ela** (G11) — **conferir no Spriter antes** (manual cap. 11) e escrever nos Desvios | `dopesheet-pointer.ts` |
| 6.3 | A **linha da virada** na folha: os losangos da timeline `body`, com o nome do corpo na célula (como a linha "Pai" proposta) | nada |
| 6.4 | A **faixa da entidade** (E13, E14): uma linha por slot com `skeleton`; a faixa começa na chave `attachment`, estica pelo `timeScale`, e mostra o nome da animação; **botão direito** lista as animações do filho (E12b) | nada; `nested` já é alvo em `keying.ts` |
| 6.5 | Linha **`slot/bone`** (célula em degrau com o nome do osso) e linha **`weights`** | `keying.ts targetInfo` |
| 6.6 | **Chave de sequência** como opção (G12): a linha `sequence` ganha porta ("Sequência…" no botão direito do desenho) | `keying.ts` já tem o alvo |
| 6.7 | Testes em `linha-do-tempo`, `chaves`, `tocador`, `eixos-e-chaves` |

---

## D7 — Cena · Árvore · Malha e pivô (G1, E9, F8 gesto, A3, A7, Chavear pesos)

**Depende de:** D2, D4b. **Parte:** Cena, Árvore, Malha e pivô. **Custo:** 2 lotes.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 7.1 | **B cria osso, Y posa, N livre** (G1); o `Alt` de redesenhar osso e de inclinar continua | `keys.ts:127-128`; teste de conflito julga |
| 7.2 | **Pendurar cria tomada** (E9): soltar uma entidade num osso cria slot + `skeleton`, como soltar imagem | `viewport.ts onDrop`, `palette-model.ts DropImageAsSlot` |
| 7.3 | **O desenho troca de osso por chave** (F8): `runReparent` caminho 2 grava `slot/bone` com `offset`; `drawingsLeftOut` sai | `reparent.ts:739-800` |
| 7.4 | **A ferramenta Malha pega caixa, máscara e caminho** (A3, D2) | `mesh-tool.ts`, `properties-model.ts:798, 828` |
| 7.5 | **Botão direito com uma porta no menu** (A7) | `viewport.ts:1132-1146` |
| 7.6 | **Chavear pesos** na aba Malha e pesos (F9, só à mão) | `mesh-panel.ts`, `mesh-doc.ts` |
| 7.7 | M7 na malha: a forma e os pesos vão para a base do corpo do instante; **testar ao vivo** "gerar malha no meio" | `mesh-doc.ts` |
| 7.8 | Testes em `cena`, `cena-selecao`, `ferramentas`, `arvore`, `malha` |

---

## D8 — Imagens · Ordem · Entidades (E6, E7, G3, I4, I8, C4, D4 gesto)

**Depende de:** D4b, D5. **Parte:** Imagens e pasta, Ordem, Malha e pivô.
**Custo:** 2 lotes.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 8.1 | A **grade do botão direito lista entidades** (E6); trocar imagem por entidade herda osso, **pivô** (a raiz cai no pivô), ordem e chaves (E7) | `image-picker.ts`, `image-grid-model.ts`, `pivot-model.ts` |
| 8.2 | **Copiar a ordem chave a chave** (G3) | `draw-order-model.ts:802-819` |
| 8.3 | **Trocar pasta de origem…** (I4): um desfazer; nome repetido avisa | `project-folder.ts sameFolderImages`, `palette.ts` |
| 8.4 | **Alinhar a imagem** (I8): PSD pela guia; sem guia, pela tela; tamanho diferente avisa | `ferramentas/src/importar/psd.ts:712` |
| 8.5 | Painel **Pivôs** (C4): a pasta inteira em grade, cruz em cada miniatura, sem janela que tranca | `pivot-dialog.ts`, `palette.ts` |
| 8.6 | **Pasta numerada vira sequência** (D4 gesto, `COMO SE FAZ EFEITO` #1) | `drop-plan.ts` |
| 8.7 | Testes em `grade-de-imagens`, `pasta-do-projeto`, `pivo`, `ordem` |

---

## D9 — Peles (I3–I15, F19/F22 na tela, F23, F25, A4–A6)

**Depende de:** D2, D4b. **Parte:** Ficha/peles + Árvore + Cena (B2/B3 do
`PLANO peles em bloco`). **Custo:** 3 lotes. **Q31: B e C aqui, não antes.**

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 9.1 | **Feitas / Ativas** no lugar do olho (I7); arrastar liga, tira, reordena; **a de cima vence**; a `default` pode sair da pilha (I10) | `skins.ts`, `skins-model.ts`, `onion.ts skinChoices` |
| 9.2 | `pilha[]` e `emEdicao` separados em `RECORTE_editor_state` (E10) | `contract.ts visibleSkins` |
| 9.3 | **Um lápis só** (I5, lote B1): osso e regra novos nascem `skinRequired` na pele do lápis; **sinal** na Árvore (B2) e na cena (B3), ícone com nome | `skins-model.ts skinForRequired`, `tree-rows.ts`, `viewport-draw.ts` |
| 9.4 | **Aplicar e modificar** (I6, lote C): ligar o lápis liga a pele na pilha; desligar some com tudo que só existia nela | `skins-model.ts` |
| 9.5 | Editar a pele **na mesma janela**; editar = apertar o lápis (I7b, I7d) | `skins.ts` |
| 9.6 | **Fazer a pele como o Spriter** (I9): uma imagem por vez **ou** a pasta inteira; **grupo do PSD = pasta** | `image-picker.ts`, `psd.ts` |
| 9.7 | **Exportar pele… / Importar pele…** (I12, P4): `.bone` só de `skins` com `rig`; a pele de fora **com osso** aparece na pilha como as outras (F23) | `io/export-skin.ts` (o fatiar é outra coisa), `open-save.ts` |
| 9.8 | **Promover pele → base** (I13, F25) | novo comando em `skins-actions.ts` |
| 9.9 | A opção **a pilha passa na virada** (`keepSkins`, I14) na ficha da chave `body` | `properties-model.ts` |
| 9.10 | Defeitos **A4** (regra Comando vazia avisa), **A5** (Inércia `0,5`), **A6** (Escala `100`) | `rules-model.ts:321`, `properties-model.ts:1007, 1052` |
| 9.11 | Testes em `peles`, `regras`, `paineis`, `arvore`, `cena` |

---

## D10 — Arquivo, exportar, importar (P1–P3, E4, E17, F16, importador do Spriter)

**Depende de:** D4b. **Parte:** Arquivo. **Custo:** 2 lotes.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 10.1 | **Novo, Abrir, Salvar falam de projeto e corpo** (P3); **Salvar** grava a pasta inteira; **Salvar como pacote** zipa o `.bonez`; **Entregar um corpo** (P2) grava um `.bone` + atlas fatiado | `shell-file.ts`, `open-save.ts`, `folder-save.ts` |
| 10.2 | **Abrir outro `.bone`** como corpo ou como entidade (E17) | `open-save.ts`, `drop-plan.ts` |
| 10.3 | Salvar entidade editada: **Novo / Por cima**, com o aviso dizendo quantos projetos usam (E4) | `open-save.ts` |
| 10.4 | **Exportar imagem** com as duas opções de recorte (F16): borda automática (padrão) ou `animation.crop`; o retângulo **magenta** na cena | `export-image.ts:67, 900`, `viewport-draw.ts` |
| 10.5 | **Importador do Spriter**: SCML → projeto (cada `entity` um corpo); `object_ref.parent` → `slot/bone`; `--assar` continua | `ferramentas/src/importar/spriter.ts` |
| 10.6 | glTF: o exportador recebe um corpo; a virada vira aviso | `export-gltf.ts` |
| 10.7 | Testes em `arquivo`, `documento`, `exportar-e-importar`, `exportar-por-pele`, `ferramentas/testes` |

---

## D11 — Casca (M4 de vez, G7, C1, C5, C6, Janela de Problemas, A1, A2)

**Depende de:** D4a–D7 prontos **e o Humberto vendo** (🗣️ `AVALIACAO DO
DIRETOR` §6). **Parte:** Casca e menus. **Custo:** 3 lotes.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 11.1 | **O interruptor sai da barra**; `Ctrl+Tab` sai; o rodapé diz *"Base: homem"* ou *"Animação: andar"* | `action-bar-model.ts MODE_ITEM`, `viewport-toolbar.ts`, `shell.ts:2213`, `keys.ts`, `contract.ts EditorMode` (apaga) |
| 11.2 | **Sistema de trocar as teclas** (G7): tabela de troca na máquina; `keys.ts` lê dela; Ajuda → Atalhos mostra as trocadas; conflito avisa | `keys.ts`, `menus.ts:872` |
| 11.3 | **Colar na quina** (C1) | `panel-groups.ts`, `shell.ts` |
| 11.4 | **Arranjos com nome** no menu Janela (C6); os arranjos **Pivô** e **Visualização** de fábrica | `menus.ts`, `layout-model.ts` |
| 11.5 | **Tela cheia de Visualização** com a lista de animações e as peles dentro (C5); `Esc` volta | `preview.ts toggleFullscreen` |
| 11.6 | **Janela de Problemas** (regra 21 com tela): a barra de avisos ganha "consertar" onde há conserto | `warning-model.ts`, `shell.ts` |
| 11.7 | **A1**: rascunho que falha avisa; **A2**: a janela de recuperar tem os dois botões escritos e "Cancelar" não apaga | `shell-drop.ts:243`, `main.ts:160` |
| 11.8 | **A10**: `npm run medir` mede o painel **cheio**; medir de novo todos os painéis novos | `ferramentas/provas/medir-paineis.mjs` |
| 11.9 | Testes em `menus`, `teclas`, `acoes`, `colunas-e-barra`, `fronteiras` |

---

## D12 — Glacê (tudo que a triagem marcou PORTA ou DEPOIS)

**Depende de:** D11. Ordem sugerida, do que ele pediu para o que é conforto:

| Ordem | O quê | Triagem |
|:---:|:---|:---|
| 1 | **Partículas** `BONE_particles`, 1ª fase (F10) — 🗣️ depois de bases e peles | Efeito 5 |
| 2 | **Biblioteca**: `humanoide-v1.bone`, andar/correr/parado/pular, Exportar/Importar animação com `rig` (F6, F20, F24 na tela) | 07 |
| 3 | **Portas do formato**: Caminho (D1), Sliders (D3), Áudio (D5), Física Simular/Reiniciar/Assar (D6), Variáveis e tags com desligar (G9, P15) | PORTA |
| 4 | **Grade em perspectiva** (F21, Q25b) | DEPOIS |
| 5 | Trajeto do movimento (OURO 3) · Flash e pulso · Tremor com semente · Breakdown | DEPOIS |
| 6 | Curvas (D8) · Pesos (D9) · Folha (D10) · Fantasma e Árvore (D12) · Métricas (D11) · Exportar APNG/HTML (D13) · Clone em escala (P11) · M + arrastar (P14) · pequenos do OURO (9, 13, 14, 15, 17, 18, 19) | DEPOIS |

---

## D13 — Manual

**Depende de:** 🗣️ a palavra dele (regra 11). Reescreve onde a reforma mexeu:
capítulos 0, 1, 4 (o modo), 2 e 5 (viram "existe"), 3 (o lápis), 9 (a
tradução do Spriter). Os 29 testes pulados voltam.

---

## A conta, para o Planejador

| Degrau | Lotes | Chats em paralelo |
|:---|:---:|:---|
| D0 | 1 (texto) | 1 |
| D1 | 2 | 1 |
| D2 ∥ D3 ∥ D4a | 3 + 3 + 2 | 3 |
| D4b | 3 | 1 |
| D5 ∥ D6 ∥ D7 | 2 + 3 + 2 | 3 |
| D8 ∥ D9 ∥ D10 | 2 + 3 + 2 | 3 |
| D11 | 3 | 1 |
| **Bolo** | **31 lotes** | — |
| D12 | 12 a 15 | conforme |
| D13 | 3 | 1 |

Para escala: a rodada de 13 e 14/09 fechou 15 versões (v12.0 a v13.2) em dois
dias com três a quatro chats.

---

## Onde este plano difere do `13` do Planejador, e por quê

| No `13` | Aqui | Por quê |
|:---|:---|:---|
| Degrau 1 = "acrescenta F1–F6 … tira o socket" numa linha | D0 (texto) + D1 (schema, validador, casos) + D2 (TS) + D3 (Python), com o **desenho** de cada campo no ARQUITETO 3 | regra 7: campo novo precisa de forma escrita antes de código; e o Python está um degrau atrás (sem §7.11) |
| Degrau 4 = casca, com M4 e G7 | M4 fica em D11 (o fim), e o **freio** sai em D4a (o começo) | 🗣️ *"só com ele vendo"*; mas o freio pode e deve sair antes — é o que ele sente na mão |
| Não existe "o documento vira projeto" | D4b | P1–P3 e a virada não cabem num `Doc` de um arquivo só |
| Os casos pendentes e os exemplos com socket não aparecem | D0.4, D0.5, D1.3 | F7 deixa dez casos e quatro exemplos órfãos |
| `13` não fala do roteiro nem dos testes que provam o modo antigo | D4a.7, D4a.8 e cada degrau | regra 9: a contagem nunca cai |
| Peles no degrau 8 | D9, ao lado de D8 e D10 | mesma coisa, com F23 e F25 escritos |
| Manual no degrau 11 | D13 | igual: só quando ele pedir |
