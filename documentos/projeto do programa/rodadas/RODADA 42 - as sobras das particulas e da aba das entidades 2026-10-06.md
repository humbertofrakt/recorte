# Rodada 42 — as sobras das rodadas 38 (partículas) e 39 (aba das entidades)

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 12h51.
**Escreve código em `editor/`.** Dois lotes, uma versão cada. Reporta a `Diretor com monitoramento de chats [410edc]`.
**Portas suas:** programa 5490, Chrome sem janela 9490. Nunca mate processo que não abriu.

**Leia antes:** `CLAUDE.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` · as conferências `41` (partículas, lote 6) e `40`, `42` (aba das entidades, lotes 6 e 7) · `27` e `22` para o contexto · `editor/src/contract.ts` · `documentos/PARTES.md`. Os chats das duas rodadas estão arquivados: o que você precisa está nesses documentos e no código.

## Lote 1 — as sobras das partículas (parte Partículas: `panels/particle-sheet.ts`, `emitter-shape.ts`, `ui/menus.ts` só as dicas)

| # | O que tem de acontecer |
|:---:|:---|
| 1 | A **Abertura (±°)** entra na receita da faísca (dica da porta e dica da Velocidade/Tamanho), e o campo Abertura ganha dica com unidade e faixa. Hoje a faísca do vazio custa 16 passos porque ninguém diz da Abertura |
| 2 | A Faísca pronta e a feita do vazio **se veem no fundo claro**: cor mais quente ou escura no fim da vida, ou um contorno. Prove com foto no fundo claro E no escuro |
| 3 | A dica da **Poeira** diz a cor dela, como as outras |

## Lote 2 — as sobras da aba das entidades (parte Entidades: `panels/palette-entities.ts`, `entities-cards-model.ts`, `entities-actions.ts`, `doc/montagem.ts`, `io/picker-problem.ts`)

| # | O que tem de acontecer |
|:---:|:---|
| 1 | **Pôr no projeto não perde a animação escolhida**: o mecha em "idle" continua em idle depois de gravar (hoje vira "livre" sem aviso). Se o formato não guarda isso para quem está em volta, o rodapé **diz** que perdeu |
| 2 | A janela **"Problemas do arquivo"** fala português e diz o nome do arquivo, sem caminho interno (hoje: "/skins/…/uri: nested skeleton … (spec 7.11)") |
| 3 | **"skins ▾"** no cartão: o lote 6 dizia que existe nos cartões de teste; o conferente não achou em nenhum. Ou aparece, ou sai do relatório |
| 4 | Em 1280×720, a trilha e os cartões dobrados **saem ao redimensionar**, não só depois de Ctrl+Z |
| 5 | Com três níveis em 1920×1080, a **Prateleira não sai da tela**: a aba rola por dentro |
| 6 | Pequenos: a pergunta do slot não diz "O de fora entra no lugar da imagem body" (frase certa: quem entra em quê) · a barra diz "2 avisos" quando a janela tem 1 problema · Pôr no projeto com arquivo faltando **avisa** antes de gravar (regra 21) |
| 7 | Decida pelo Spine/Spriter e escreva a suposição: **mecha sobre o slot weapon** (uma entidade grande num slot pequeno) é aceito como teste, ou recusado? |

## As réguas

| # | |
|:---:|:---|
| 1 | **Semáforo:** antes de CADA gravação em `editor/`, olhe `backup/FECHO-EM-CURSO.txt`; se existe, não grave. Para fechar: "quero fechar" → PODE → crie o arquivo ("rodada 42, HH:MM") → meça → apague ao dizer "fechei a vN.N". As rodadas 40 e 41 gravam em `editor/` ao mesmo tempo, em outras partes |
| 2 | Passagem (`contract.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `main.ts`): só acrescentando, relendo do disco antes de gravar. **Tipo mudado e quem o usa, no mesmo golpe** |
| 3 | Regra 26: o teste falha antes. Prove na tela com mouse, no `programa/` montado ou no editor do disco |
| 4 | Fotos em `backup/fotos-obra/rodada-42/`, 1920×1080 e 1280×720 |
| 5 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG · `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · contagem por arquivo. Único vermelho esperado: o antigo do manual |
| 6 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/`. Nada de campo novo no formato: se o item 1 do lote 2 pedir, pare e me diga |
| 7 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 8 | **Não pergunte nada ao Humberto.** Suposição escrita, siga, e me diga |

## O que entregar

A cada versão, `SendMessage` ao Diretor, **6 linhas**. No fim: **"larguei a máquina"**.


## Desvios e suposições (do executor, 06/10/2026)

| # | O quê | Por quê |
|:---:|:---|:---|
| L1 | A faísca do vazio continua com 16 passos (10 da ficha, 1 da Abertura, 5 da rajada). Agora todos estão nas dicas | a Abertura é um passo de verdade; o que faltava era dizer |
| L2·1 | A escolha do teste vai para o arquivo pelos campos que a spec já tem (7.11): `animation`, `inheritAnimation`, `skins`. Nenhum campo novo | a ficha pedia parar só se precisasse de campo novo |
| L2·2 | A tradução do aviso mora em `panels/warning-model.ts` (fora da lista da ficha) | é o único lugar que traduz os avisos do leitor, para a barra e para a janela |
| L2·3 | O **skins ▾** aparece, e foi visto na tela, numa entidade com skin **própria** (cópia do mecha com a skin `inverno` dentro). Nenhuma entidade de exemplo tem skin própria. A skin que vem de **outro arquivo** (`assets.skins` do mecha) **não** é lida pela aba: fica para outra rodada | sem isso o menu não tem o que mostrar |
| L2·5 | A Prateleira cabe à vista em 1920×1080 com três níveis: a montagem rola por dentro, e a Prateleira fica no pé da aba. Sem `sticky` (a régua do lote 48 o guarda para a linha do tempo e o diálogo). Se ele espremer a aba a ~100 px, a aba inteira rola | a barra de cima (Na cena, Pôr no projeto) sozinha já ocupa ~100 px |
| L2·5 | `palette.css` é da parte Imagens; o bloco das entidades mora nele | só acrescentei regras às classes `entidades-*` |
| L2·6 | **"2 avisos" contra 1 problema: não reproduzi.** Pelo menu e por código, com slot sumido, a barra disse "1 aviso" e a janela "1 problema". As duas leem a mesma lista (`allWarnings`). O caso do conferente passou pela pasta reaberta, que não refiz com pasta de verdade | regra 26: não conserto o que não vi falhar |
| L2·6 | Pôr no projeto com o arquivo faltando é **recusado**, com a frase no rodapé (para baixo e para cima) | gravar apontaria o projeto para um arquivo que não existe |
| L2·7 | **Mecha sobre o slot weapon: aceito como teste.** No Spriter uma sub-entidade entra em qualquer lugar, de qualquer tamanho; no DragonBones um slot com armature também; o Spine não tem esqueleto dentro de esqueleto. Nenhum dos três recusa pelo tamanho. O teste não grava nada, e Ctrl+Z volta. Um teste fixa isso | a recusa existe para o que não faz sentido (a espada no próprio slot), não para o que é só estranho |
| L2·6 | A dica da pergunta do slot diz quem entra: o de fora da cadeia (no segundo nível é o mecha que entra no capacete, não o herói) | vi o erro na tela, na primeira versão da frase |
