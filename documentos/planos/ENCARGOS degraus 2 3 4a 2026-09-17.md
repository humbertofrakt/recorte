# Encargos da rodada — degraus 2, 3 e 4a — 17/09/2026

Escrito pelo **PLANEJADOR · animador-5e** (a janela que fez os degraus 0 e 1),
por ordem do Humberto, 17/09/2026, com as três ordens que ele ditou. **A peça
vive neste arquivo; a mensagem é só o resumo.** Quem perder o contexto lê:
`CLAUDE.md` · `documentos/QUEM E QUEM.md` · `ESTADO.md` · este arquivo · o
seu degrau no `ARQUITETO 4` · a spec `formato/ESPECIFICACAO 2026-09-17.md`.

**O congelamento acabou para estas três pastas**, uma por chat: `runtime/`
(A), `runtime-python/` (B), `editor/src` (C). Cada chat mexe só na sua.

## O caminho

```
Chat A / B / C  →  PLANEJADOR (animador-5e)  →  Humberto
```

Dúvida sobe por `SendMessage` para `animador-5e`. **Nenhum chat abre painel de
pergunta** (regra 23): escreva a suposição no fim deste arquivo, na seção do
seu chat, e siga. Ao abrir: `ListAgents`, título da janela pela regra 22
(`EXECUTANDO · runtime TS`, `EXECUTANDO · runtime Python`, `EXECUTANDO · editor
sem freio`), e a sua linha em `documentos/QUEM E QUEM.md`.

## Modelos

Os três em **Opus**: cada encargo mexe em milhares de linhas sob um contrato de
testes que não pode cair, e o B escreve um runtime só pelo texto da spec.

## Regras que valem para os três

| # | Regra |
|:---:|:---|
| 1 | **Backup antes de escrever** (regra 1 do `CLAUDE.md`): pasta inteira do lote em `backup/<pasta>_2026-09-17_antes-do-degrau-N/`, com linha no `backup/INDICE.md` |
| 2 | **A contagem de testes nunca cai** (2.868 hoje, 2.838 verdes, 29 pulados, 1 vermelho pré-existente do manual, 15/09, que **não é seu**). Teste que prova o modo antigo é **reescrito** para provar o novo, nunca apagado |
| 3 | Durante o lote, rode só os testes da **sua** pasta. A suíte inteira só no fecho. Vermelho na pasta de **outro** chat: não conserte; mande mensagem ao PLANEJADOR |
| 4 | **Portas fixas**: `npm run roteiro` e `npm run medir` são só do **Chat C**. A e B não os rodam |
| 5 | **Cada lote fecha uma versão**: `python ferramentas/versao.py N.N "o que mudou"`, próximo número livre no `backup/INDICE.md`; o script recusa repetido — se recusar, pegue o seguinte. `CHANGELOG.md` com subtítulo `### vN.N — … — 17/09/2026` no mesmo lote |
| 6 | **Onde o programa não entende, ele avisa** (regra 21). Nunca um verde que não foi medido |
| 7 | Terminou: mensagem curta ao PLANEJADOR (`animador-5e`): versão, números, o que ficou de fora. E **pare**. Não comece o degrau seguinte |
| 8 | Os casos **não saem** de `casos-pendentes/`. Quem os move para `casos/` é o PLANEJADOR, quando **A e B** passarem (§12.8). Rode-os com `--casos conformidade/casos-pendentes` |

---

## Chat A — Runtime TypeScript (degrau 2)

**A ordem do Humberto, palavra por palavra:**

> Execute o degrau dois, só ele. Leia a spec zero ponto dois e o ARQUITETO três. Implemente no runtime TypeScript: a pilha de peles sem default implícita; o Actor com a virada por chave body, um esqueleto por corpo montado uma vez, nunca remontado; slot barra bone com transform; weights; pele externa com osso; rig reference; socket sai; body no dump; aviso de auto-interseção da clipping. Pronto quando os sessenta e oito casos passam e a suíte não cai. Não toque no Python nem no editor. Pare e me mostre.

**Leia:** spec §2.8, §4.4, §4.7, §4.8, §5.1, §7.1, §7.9, §7.11, §9.1, §9.2, §9.5, §9.6, §9.10, §9.13, §12.4; `ARQUITETO 3` §3 a §9; `ARQUITETO 4` D2 (tabela 2.1 a 2.10). Os 15 casos de `conformidade/casos-pendentes/`, cada um com a conta no `leiame.md`.

**Mexe em:** `runtime/src/`, `runtime/testes/`, `ferramentas/src/conformidade/` (o pose dump), `ferramentas/conformidade.mjs` se precisar, `conformidade/casos/A-025` e `A-026` (só o `esperado.json`/`leiame.md`, se a pilha mudar o número — **conferido à mão**, nunca `--gerar` cego).

**Não toque:** `runtime-python/`, `editor/`, `formato/`, `site/`.

| Item | O que muda | Onde hoje |
|:---|:---|:---|
| Pilha (F19, F22) | `activeSkins` é a pilha, de baixo para cima; nenhuma `default` implícita; `Skeleton` novo nasce com `["default"]`; a de cima vence | `setSkin`, `rebuildSkinLookup` |
| `Actor` e a virada (F1, F3) | `Actor { esqueletos: Map<uri, Skeleton>, arquivo }`; `pose(actor, anim, t)` com `corpoEm` (antes da primeira chave `body` vale o arquivo); casamento por nome com o corpo do instante, aviso `BODY_UNMET` uma vez; `keepSkins`; entidade continua no slot de mesmo nome e mesma `uri`; física do esqueleto que entra começa com `reset`; **nenhum esqueleto remontado no meio**; `loadProject`/`.bonez` monta um `Skeleton` por corpo citado | `Skeleton`, `applyAnimation`, `nested.ts`, `AnimationState`, `CanvasRenderer` |
| `slot/bone` + `transform` (F8) | `Slot.bone` aplicado; `setToSetupPose` devolve o do arquivo; `region`, malha sem `binding`, `point`, caixas e `skeleton` multiplicam `T·R·S` do `transform` **nessa ordem** (C-295 prende) | `Slot`, `computeWorldVertices` |
| `weights` (F9) | pesos do quadro por `(slot, skin, placeholder)`, mesmo caminho do `deform`; sem renormalizar | `VertexAttachment` |
| Pele de fora com osso (F23) | ao carregar `assets.skins`: entram `bones`/`constraints` `skinRequired` e `slots`, no **fim** dos arrays; `parent` do `rig` ou do mesmo arquivo; local vence; sem `skinRequired` ignorado com L2 | loader de externos |
| `rig.reference` (F24) | `k = hospedeiro.length / reference.length` multiplica `bone/x` e `bone/y` ao copiar | idem |
| Socket sai (F7) | só o caso simples em `computeParentMatrix`; `point.socket`, `skeleton.socket/childSocket`, `rig.sockets` deixam de existir (propriedade desconhecida) | `skeleton-attachment.ts`, `point.ts`, `nested.ts` |
| Dump (§12.4) | `body` por amostra (sempre; `null` = o arquivo); `slots.bone` (o osso aplicado); canais do corpo do instante | `pose-dump.ts` |
| Clipping (§7.7) | aviso L2 de auto-interseção ao carregar | `loader.ts` |
| `animation.crop` | lido e guardado; nada o usa | loader |

**Os testes de socket em `runtime/testes/aninhado.test.ts` e `loader.test.ts`** são reescritos para provar a entidade pela imagem (mesma contagem ou mais).

**`ferramentas/visualizador/dist/`** é o runtime compilado que a página do validador e o `validar.mjs` importam (`bonez.js`). Se houver script que o gera, rode-o no fecho; se não houver, diga ao PLANEJADOR.

**Pronto quando:** `node ferramentas/conformidade.mjs` 53 de 53 **e** `node ferramentas/conformidade.mjs --casos conformidade/casos-pendentes` 18 de 18 (= 71; o C-298 entrou às 10:20 a pedido do Chat A; o C-299 e o C-300 entraram no fecho, quando A e B leram o relógio do filho de jeitos diferentes: prendem o Apêndice C, 1 e 6); `npx vitest run runtime/testes ferramentas/testes` sem queda; no fecho, a suíte inteira e `npx tsc --noEmit -p editor/tsconfig.json`. Versão fechada, mensagem ao PLANEJADOR, e para.

---

## Chat B — Runtime Python (degrau 3)

**A ordem do Humberto, palavra por palavra:**

> Execute o degrau três, só ele. Leia apenas a spec zero ponto dois — não olhe o código TypeScript. Primeiro implemente o esqueleto aninhado da seção sete ponto onze, que ainda falta. Depois o mesmo do degrau dois. Pronto quando os sessenta e oito casos passam. Não toque no TypeScript nem no editor. Pare e me mostre.

**Leia:** só `formato/ESPECIFICACAO 2026-09-17.md` (a lista do Chat A diz as seções) e os `leiame.md` dos 15 casos pendentes. **Não abra `runtime/src`.** É a regra do segundo runtime desde a fase 7: ele existe para descobrir onde a spec não basta. Onde a spec não bastar, escreva na seção "Onde a spec não bastou" no fim deste arquivo, com a suposição que fez, e siga.

**Mexe em:** `runtime-python/` (o runtime, o adaptador, `conformidade.py`, os testes dele).

**Não toque:** `runtime/`, `editor/`, `formato/`, `site/`, `conformidade/casos*`.

| Ordem | O quê |
|:---:|:---|
| 1 | **§7.11, esqueleto aninhado** (a entidade) e as timelines `nested` (§9.9): a raiz do filho em `M_ossoDoSlot × T·R·S` do anexo; as duas camadas (`baseAnimation` por baixo); os canais prefixados `<slot>/` no dump; eventos `<slot>/<evento>`. Casos C-270, C-273, C-274 |
| 2 | Animações e peles de fora (§2.8): C-275, C-276, C-277, C-279 |
| 3 | O mesmo do degrau 2: pilha, `Actor`/`body`, `slot/bone` + `transform`, `weights`, pele com osso, `rig.reference`, `body` e `slots.bone` no dump. Casos C-290 a C-297 |

**Pronto quando:** `python runtime-python/conformidade.py` 53 de 53 **e** os 16 pendentes (com a mesma opção `--casos` do executor de TS; se o `conformidade.py` não a tiver, acrescente) = 69; o C-298-pilha-sem-default entrou às 10:20 do dia 17; os testes de `runtime-python/` sem queda. Versão fechada, mensagem ao PLANEJADOR, e para. O confronto dos dois (`npm run conformidade:dois`) é do PLANEJADOR, quando A e B tiverem terminado.

---

## Chat C — Editor sem freio (degrau 4a)

**A ordem do Humberto, palavra por palavra:**

> Execute o degrau quatro-a, só ele. Não depende do runtime novo. Tire o que recusa e esconde: editar sempre grava, sai o bloqueado e o gravar sozinho; sai o semáforo; nenhuma ferramenta some por modo; o tocador nunca apaga; os recados de Montagem viram foi pra base. O interruptor da barra fica. Reescreva os testes, a contagem não cai. Roteiro catorze de catorze. Não toque no runtime. Pare e me mostre.

**Leia:** `editor/src/contract.ts` inteiro (a lei do editor); `documentos/PARTES.md`; `ARQUITETO 4` D4a (tabela 4a.1 a 4a.8); `documentos/programa-novo/02` (M1–M7) e `05` (G13); `ARQUITETO 3` §2.2 e §14.

**Mexe em:** `editor/src/`, `editor/testes/`, `ferramentas/provas/roteiro-30.mjs` (passos 1 e 9). `contract.ts` e `main.ts` são arquivos de passagem: só acrescentando ou tirando o que a tabela manda.

**Não toque:** `runtime/`, `runtime-python/`, `formato/`, `site/`, `documentos/manual/`.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 4a.1 | **Editar sempre grava** (M6): `autoKey` sai; `setPropertyOrKey` com dois caminhos (base aberta → setup; animação aberta → chave); `PoseOutcome` perde `'bloqueado'`; trocar imagem grava chave (Q9) | `pose-mode.ts`, `mesh-doc.ts:399`, `draw-order-model.ts:717`, `image-picker.ts:82` |
| 4a.2 | **Chavear** (`K`) e **Chavear tudo** (`Ctrl+K`) ganham a dica "protege a pose"; o botão **Gravar sozinho** e a tecla `A` saem | `keys.ts`, `menus.ts`, `dopesheet-player.ts` |
| 4a.3 | **Semáforo sai** (G13) | `keyButtonState`, `keyButtonHint`, CSS `dope-chavear-*` |
| 4a.4 | **Nenhuma ferramenta some**: `Tool.modes`, `toolsForMode`, `syncToolModes`, `toolWrongMode`, `toolForKey` por modo saem; Malha e Pesos valem sempre (a forma vai para a base) | `mesh-tool.ts:151-196`, `weights-tool.ts`, `contract.ts` |
| 4a.5 | **O tocador nunca apaga** (M5): com a base aberta mostra `0,00 s`, um losango, botões de tocar cinza **com dica** | `dopesheet-player.ts:522-535`, `dopesheet.ts:810` |
| 4a.6 | Recados "é da Montagem" somem ou viram "foi para a base" | `create-bone.ts:437, 469`, `reparent.ts:662, 798`, `mesh-doc.ts` |
| 4a.7 | Roteiro passos 1 e 9: "corpo vazio, base aberta"; "abre a animação" | `ferramentas/provas/roteiro-30.mjs` |
| 4a.8 | Testes reescritos para o novo: `animando`, `chaves`, `malha`, `ferramentas`, `menus`, `teclas`, `acoes`; os 29 do manual pausado continuam pulados | `editor/testes/` |

**`doc.animation === null` continua sendo a base aberta.** O interruptor `Montagem | Animando` **fica** na barra até o D11; só a dica passa a dizer **Base | Animação**. Tecla tratada uma vez; botão com nome na dica; tecla nova é uma linha em `ui/keys.ts` (o teste de conflito julga); `fronteiras.test.ts` decide quem importa quem.

**Pronto quando:** `npx vitest run editor/testes` sem queda; `npx tsc --noEmit -p editor/tsconfig.json` limpo; `npm run roteiro` 14 de 14; `npm run medir` 22 de 22 de lado (altura não pode piorar: 15 de 22); no fecho, a suíte inteira. Versão fechada, mensagem ao PLANEJADOR, e para.

---

## Desvios e suposições (cada chat escreve na sua)

### Chat A

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| A1 | **`setSkin` fica como era** (a `default` por baixo, sozinha). A pilha pura entra por uma chamada nova, `setSkinStack(lista)`. `activeSkins` continua sem a `default`; `skinStack` é a pilha inteira. O `Skeleton` novo nasce com a pilha `["default"]` | O editor (`preview.ts`, `onion.ts`, `export-image.ts`, `exibicao.test.ts`) chama `setSkin` sem a `default` e conta com ela por baixo. Mudar `setSkin` apagaria a arte da `default` no editor, e o editor não é meu. Quando o editor passar para a pilha (D9), ele troca para `setSkinStack` |
| A2 | Na sonda, `skins` **é a pilha**, de baixo para cima; ausente = `["default"]` | É o que o `leiame.md` do C-277 e do C-293 diz. A-025, A-026 e C-280 dão o mesmo número assim: os `esperado.json` deles não mudaram |
| A3 | `conformidade/adaptador-referencia.mjs` **não foi tocado** (a pasta é do PLANEJADOR). Para os casos pendentes ele precisa passar a opção `files` ao `loadSkeletonFile` e as `bodies` ao `buildPoseDump`, como faz `ferramentas/conformidade.mjs` | Os 53 casos de `casos/` não leem arquivo vizinho, então o adaptador continua passando neles |
| A4 | **Toquei `ferramentas/testes/conformidade.test.ts`**, fora das pastas da lista: dois testes provavam o dump sem `body` e sem `slots.bone`. Foram reescritos para provar o formato novo; a contagem não mudou. Backup em `backup/degrau-2_2026-09-17_antes/ferramentas/` | A §12.4 do 0.2 torna os dois campos obrigatórios. É o teste do `pose-dump.ts`, que é meu |
| A5 | Os arquivos de fora são dobrados **no JSON, antes de carregar** (`runtime/src/externos.ts`), e não nas classes carregadas | "O corpo é montado uma vez" (§2.8): o loader vê um arquivo só, e todas as regras dele valem para o que veio de fora. Os atlas de uma pele de fora entram depois dos do corpo, na lista de atlas; a `uri` de um anexo `skeleton` de pele de fora resolve contra o arquivo da pele |
| A6 | O relógio da camada de fundo (`tBase`, §7.11) conta do **começo da animação do pai**, e não do instante em que o anexo ficou ativo por uma chave `attachment` | O relógio do filho já era derivado assim (a mesma pose para o mesmo `t`, régua R1). Nenhum caso prende a chave `attachment` no meio. Fica para um caso próprio |
| A7 | O evento de um filho sai no dump com o tempo **do relógio do filho** | A §12.4 não diz qual relógio. No C-270 os dois coincidem (0,5) |
| A9 | **A6 e A7 deixam de valer** (v13.7). O runtime segue o Apêndice C da spec: relógio do filho pela corrida de chaves `slot/attachment` (regra 1), evento do filho no relógio do pai (regra 6), e as outras catorze. O comentário do `setSkin` diz "compatibilidade com o editor até o D9", como o PLANEJADOR pediu | Mensagens do PLANEJADOR de 17/09: A1 aceito com essa condição; o Apêndice C é normativo |
| A8 | Não fiz `loadProject` à parte: `loadSkeletonFile` (solto com `files`, ou `.bonez`) já devolve `bodies`, e `new Actor(data, bodies)` monta um `Skeleton` por corpo | Uma porta só para os três encodings, como já era |

### Chat B — inclusive "Onde a spec não bastou"

Escrito pelo Chat B (EXECUTANDO · runtime Python), 17/09/2026. Só pela spec 0.2 e pelos `leiame.md`; `runtime/src` não foi aberto.

**Desvios do encargo**

| # | Desvio | Por quê |
|:---:|:---|:---|
| 1 | Os três lotes fecharam **numa versão só**, não em três | O código dos três mora nos mesmos arquivos (`loader.py`, `actor.py`, `pose_dump.py`): o carregamento de fora serve à entidade, aos corpos e às peles ao mesmo tempo. Não havia um retrato do lote 1 sozinho para guardar |
| 2 | Arquivo novo `runtime-python/recorte/actor.py`, e testes novos: 14 em `testes/test_projeto.py`, 2 em `testes/test_anexos.py` | A virada e a entidade não cabiam em `skeleton.py` sem ciclo de import com `animation.py` |
| 3 | A pasta tinha **16** pendentes, não 15 | O C-298 (pilha sem `default`) apareceu no meio da rodada. Passa |
| 4 | A troca de busca por pele no passo 3 do `deform` (9.6) | O Python usava a ordem de gravação na memória; a spec manda a ordem do array `skins`. Corrigido junto, porque `weights` usa a mesma busca |

**Onde a spec não bastou** (a suposição que fiz, e segui)

| # | Seção | O que faltou | O que o Python faz |
|:---:|:---|:---|:---|
| 1 | 7.11, relógio do filho | "Começa em 0 quando o anexo fica ativo", mas o quadro é função do tempo (princípio 11) e não diz como achar esse instante sem guardar estado | O início da **corrida** de chaves `slot/attachment` com o mesmo valor que vale em `t`; sem essa timeline, 0. Uma troca de **pele** que mostra a entidade não zera o relógio |
| 2 | 7.11, laço | "Em laço, a entidade recomeça onde foi solta" não diz se o relógio do filho usa o tempo do pai enrolado ou corrido | O tempo **enrolado** (`t mod duration`): o filho recomeça a cada volta do pai |
| 3 | 7.11 fonte 1 (`nested/animation`) | Não diz se a animação escolhida pela chave toca em laço | Usa o `loop` do anexo |
| 4 | 7.11 fonte 2 (`inheritAnimation`) | Idem | Usa o laço do pai (o `loop` da sonda) |
| 5 | 9.9 `nested/time` | "Dirige só a animação de cima", mas não diz se vale para as fontes 2 e 3 | Vale para a animação de cima, venha da fonte 1, 2 ou 3; `timeScale` ignorado |
| 6 | 7.11 e 12.4, evento do filho | Diz o nome (`<slot>/<evento>`), não o `time` que vai no dump | O tempo no relógio do **pai**: `tempo da amostra − (relógio do filho − tempo do evento) / timeScale`. A janela do filho é desde a amostra anterior, no relógio dele; trocar de animação reabre a janela em −∞. O C-270 dá 0,5 nas duas leituras, então não separa |
| 7 | 7.11, `baseAnimation` | Não diz se os eventos do fundo chegam ao jogo | Chegam, prefixados, como os de cima |
| 8 | 2.8, pele de fora com malha pesada | `binding.bones` é **índice** (4.7) no arquivo da pele; no corpo os índices são outros | Traduz pelo **nome** do osso do arquivo da pele para o índice no corpo; nome que o corpo não tem vai para o índice 0 com `RIG_UNMET` |
| 9 | 2.8, slot de fora com nome de slot local | A tabela dá a regra do osso repetido, não a do slot | A mesma do osso: vale o local, `EXTERNAL_DUPLICATE` |
| 10 | 9.13 `keepSkins` | "Nome que o corpo novo não tem é ignorado": ignorado na resolução, ou tirado da pilha? | Fica na pilha e é ignorado na resolução (aviso uma vez). Voltar a um corpo que tem a pele a faz valer de novo |
| 11 | 9.13, corpo dentro de corpo | Não diz se uma chave `body` num corpo carregado, ou num filho aninhado, carrega outro corpo | Não carrega: profundidade 1, só as chaves `body` do arquivo aberto |
| 12 | 9.13, física do corpo que entra | "Começa como no primeiro `updatePose`": um corpo nunca posado já está assim | `physicsReset` só quando o corpo **volta** (já tinha sido posado) |
| 13 | 9.5 `transform` | A lista é `region`, `mesh` sem `binding`, `point`, caixa retângulo/elipse e `skeleton`. Não cita caixa polígono, `clipping` e `path` sem `binding` | Aplica a **todo** anexo sem pesos, pela mesma razão da malha sem `binding` |
| 14 | 4.7 e 9.10, alvo que falta | Nomeia `BODY_UNMET` (na virada) e `RIG_UNMET` (na carga), mas não o aviso do instante numa animação sem virada | `BODY_UNMET` quando a animação tem timeline `body`; fora disso, `TARGET_MISSING` (código **inventado**, só aviso) |
| 15 | 12.4, sonda sem `skins` | Não diz qual pilha vale quando a sonda não traz `skins` | A de nascença, `["default"]` (4.4) |
| 16 | 7.11 e 9.13, instância que some | "A instância antiga some" só está dito para a virada | Some sempre que o slot deixa de mostrar a entidade (chave, pele ou corpo), com aviso `NESTED_GONE` uma vez |

**Ficou de fora:** `inheritColor` (lido, não aplicado; nenhum canal mede, e o `leiame` do C-270 diz o mesmo); aviso de auto-interseção da `clipping` (não estava na lista do Chat B); `animation.crop` (o leitor ignora, como qualquer campo informativo). O Python nunca teve socket: nada a tirar.

### Chat C

Escrito pelo Chat C (EXECUTANDO · editor sem freio), 17/09/2026. Versão **v13.5**. Só `editor/src`, `editor/testes` e `ferramentas/provas/roteiro-30.mjs`.

**Desvios do encargo e suposições**

| # | Desvio ou suposição | Por quê |
|:---:|:---|:---|
| 1 | Os dois lotes fecharam **numa versão só** | O freio morava nos mesmos arquivos (`pose-mode.ts`, os painéis, a casca). Não havia retrato do lote 1 sozinho |
| 2 | `'bloqueado'` saiu; onde a animação aberta **não está no arquivo**, a saída é `'recusado'`, com frase no rodapé (`REFUSED_MESSAGE`) | Regra 21: não achar onde gravar se diz, não se cala |
| 3 | **Redesenhar osso (Alt)** e **pegar os desenhos** com o Criar osso valem com uma animação aberta. Escrevem na base, medidos na pose da tela, como o osso novo já era. Rodapé: *"(foi para a base)"* | Eram dois recados "é da Montagem. Ctrl+Tab troca de modo". O destino por corpo é do D7 |
| 4 | **Virar filho com osso e desenho juntos**, com animação aberta: o osso ganha a chave de pai e o desenho **troca de osso na base**, medido na pose da tela. São **dois passos** de desfazer | O recado antigo dizia "o desenho muda de osso na Montagem", e o desenho ficava onde estava. Trocar só a frase para "foi para a base" seria mentira. A chave `slot/bone` (F8) é do D7 |
| 5 | Ferramenta **Malha** com animação aberta: criar e apagar vértice, ligar e desligar aresta passam a valer. Vão para a base, e o rodapé diz | Antes não faziam nada, calados. **Risco conhecido, não mexido:** uma chave `deform` que já existia fica com o tamanho velho. Isso já acontecia com a base aberta. É do D7 |
| 6 | O interruptor fica `Montagem \| Animando`, e o item do menu fica "Montagem ⇄ Animando". Mudaram as **dicas** (Base \| Animação) e o **rodapé** ("Base" e "Animação: nome") | O encargo manda mudar só a dica até o D11. O rodapé dizia "Gravação automática desligada", que deixou de existir |
| 7 | O teste do PROJETO DO MENU lê um documento de 08/09 que ainda lista a tecla `A`. **O documento não foi tocado.** O teste ganhou a lista `REMOVED_BY_DECISION`, e confere que a `A` não voltou | Documento datado não se reescreve, e `documentos/` não é pasta do Chat C |
| 8 | Em `ajuda.test.ts`, "Gravar sozinho" saiu da lista de rótulos. Esses testes são do manual e continuam pulados | O manual ainda cita o Gravar sozinho: é do D13 |
| 9 | "Não mexer nos desenhos" e "Não mexer nas caixas" continuam valendo só com a base aberta. Só a dica mudou de "modo Montagem" para "base aberta" | Não é recusa da tabela 4a; é limite da conta de compensar |
| 10 | Roteiro, passo 9: espera o botão Tocar acender antes de conferir | Ele acende no redesenho seguinte; sem a espera, a prova lia o botão errado |

**Números do fecho**

| Prova | Resultado |
|:---|:---|
| `npx vitest run editor/testes` | 1.983 (1.953 verdes, 29 pulados, 1 vermelho do manual, de 15/09). Igual à linha de base |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `npm run roteiro` | 14 de 14 |
| `npm run medir` | 22 de 22 de lado, 15 de 22 de altura. Igual a antes |
| Suíte inteira | 2.868 (2.835 verdes, 29 pulados, 4 vermelhos). O do manual é antigo. Os outros três estão em `ferramentas/testes/conformidade.test.ts` (o pose dump): pasta do **Chat A**, não consertados |

**Ficou de fora:** nada da tabela 4a.1 a 4a.8. O `ESTADO.md` não foi tocado: é do PLANEJADOR.

---

## Fecho da rodada — 17/09/2026, tarde, pelo PLANEJADOR

| Chat | Versão | Números |
|:---|:---:|:---|
| B, runtime Python | v13.4 | 53 + 18 pendentes; 145 testes próprios; só pela spec; 16 leituras viraram o Apêndice C |
| C, editor sem freio | v13.5 | editor 1.983 iguais; roteiro 14/14; medição 22/22 e 15/22; três desvios anotados para o D7 |
| A, runtime TS | v13.6 → v13.7 | 53 + 18; 960 testes; Apêndice C aplicado (A6 e A7 retirados) |
| Planejador | v13.8 | adaptador de referência com `files` e `bodies`; `comparar-runtimes --casos`; C-298, C-299 e C-300; os 18 movidos para `casos/`; confronto 71 de 71 |

**Provas do fecho:** `node ferramentas/conformidade.mjs` 71/71 · `python runtime-python/conformidade.py` 71/71 · `node ferramentas/comparar-runtimes.mjs` 71/71 concordam · `npx vitest run` (o número está no `CHANGELOG`, v13.8) · `tsc` limpo · roteiro 14/14 · medição 22/22 e 15/22 · `programa/` montado.

**Próximo degrau:** D4b (o documento vira projeto; a virada na tela), depois D5 ∥ D6 ∥ D7. Só com a palavra do Humberto.
