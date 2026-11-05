# Quem é quem — os chats do projeto

**Atualizado em 14/09/2026 pelo PLANEJADOR.** Quem entrar agora lê isto primeiro.

O nome da JANELA é o papel. O **endereço** é outra coisa: é o nome que o
`SendMessage` entende. Os dois estão na mesma linha abaixo — use a coluna
"endereço" para escrever, e a coluna "janela" para falar com o Humberto.

| Papel | Janela | Endereço (`SendMessage`, campo `to`) | Faz |
|:---|:---|:---|:---|
| **Diretor** | DIRETOR · animador-01 | `animador-01` | fala com o Humberto e planeja. É a **única** porta que dá nele |
| **Planejador** | PLANEJADOR · animador-f6 | `animador-f6` | escreve os planos, divide em partes, manda e administra os executores |
| Executor | LINHA DO TEMPO · animador-97 | `animador-97` | copiar e colar chaves — itens 4 e 8 (`panels/dopesheet*.ts`, `panels/graph.ts`, `anim/timeline-tools.ts`, `anim/keying.ts`) |

**Os endereços de 14/09 morreram todos** (animador-36, animador-c1, animador-47,
animador-35, animador-4b, planejador). As janelas foram fechadas ou reiniciadas
entre um dia e outro: **endereço não sobrevive à noite.** Confira com
`ListAgents` antes de escrever para alguém, e corrija esta tabela quando mudar.


## A regra do caminho

```
Executor  →  PLANEJADOR  →  DIRETOR  →  Humberto
```

**Nenhum executor fala com o Humberto.** Dúvida sobe; decisão desce.

## Se o endereço não funcionar

Os endereços mudam quando uma janela é fechada, limpa ou recriada. Se o
`SendMessage` responder *"No agent named … is reachable"*:

1. Rode `ListAgents` e veja quem está vivo.
2. Escreva para quem tiver o nome mais próximo e pergunte quem é.
3. **Corrija esta tabela** — quem descobrir, atualiza. Um endereço errado aqui
   custa meia hora a todo mundo.

## O que fazer antes de pedir ajuda

O trabalho nunca vive só na mensagem: ele vive num arquivo em
`documentos/planos/`. Se você perdeu o contexto (uma limpeza, uma janela nova),
leia, nesta ordem: `CLAUDE.md` · `ESTADO.md` · `documentos/PARTES.md` ·
`editor/src/contract.ts` · o plano da sua parte. Isso basta para recomeçar sem
perguntar nada a ninguém.


## O nome da janela leva o endereço dentro — 14/09/2026, pelo DIRETOR

O Humberto: *"ninguém sabe o nome de ninguém."* A causa era a janela dizer
uma coisa e o `SendMessage` entender outra. **A partir de agora o título da
janela é `PAPEL · endereço`** — quem olha a barra lateral já sabe como escrever
para aquele chat.

Cada chat descobre o PRÓPRIO endereço rodando `ListAgents`: a primeira linha da
resposta diz *"This session is …"*. Depois é só `set_session_title` com `self`.

## A regra das portas — 14/09/2026

`npm run roteiro` e `npm run medir` abrem o editor em portas FIXAS (5191 e 9335).
**Dois chats rodando isso ao mesmo tempo brigam pela mesma porta**, e o resultado
é vermelho falso: quase todos os passos caem, e quem rodou sai caçando um
defeito que não existe.

| Regra | |
|:---|:---|
| Quem roda roteiro e medição | **só quem está fechando a versão**, e um de cada vez |
| Quem não está fechando | `npx vitest run` e `npx tsc --noEmit` à vontade — esses não abrem porta |
| Vermelho estranho no roteiro | pergunte ao PLANEJADOR se alguém estava fechando. Antes de caçar defeito, confira se a casa estava vazia |


## 14/09/2026, fim do dia — O APLICATIVO REINICIOU E OS ENDEREÇOS MUDARAM

**Todos os endereços da tabela acima estão MORTOS.** O aplicativo reiniciou e as
janelas do time — PLANEJADOR, CHAVE PARENT, LINHA DO TEMPO, MALHA, LEVANTAMENTOS
e PESQUISA — deixaram de existir. Até o Diretor trocou de endereço:
`animador-36` virou **`animador-01`**.

| Papel | Janela | Endereço de agora |
|:---|:---|:---|
| **Diretor** | DIRETOR · animador-01 | `animador-01` |
| Planejador | — | **vago** |
| Executores | — | **vagos** |

O trabalho **não** se perdeu: a v13.0 está fechada, com zip em `backup/versoes/`,
`ESTADO.md` atualizado, 2.829 testes e o `programa/` montado. O que morreu foi a
conversa, não o disco.

**Para quem chegar agora:** leia `ESTADO.md`, depois
`documentos/planos/QUADRO ABERTO 2026-09-14.md` e
`documentos/planos/MAPA da próxima rodada 2026-09-14.md`. O trabalho vive no
arquivo, nunca na mensagem — é por isso que ele sobreviveu ao reinício.

**A lição, escrita para a próxima vez:** endereço de chat é coisa de um dia.
Quem assumir um papel roda `ListAgents`, lê o próprio endereço na primeira linha,
põe `PAPEL · endereço` no título da janela e **corrige esta tabela**.

## 15/09/2026 — o manual libera, tabela corrigida pelo MANUAL

| Papel | Janela | Endereço de agora | Faz |
|:---|:---|:---|:---|
| **Diretor** | DIRETOR · animador-01 | `animador-01` | fala com o Humberto e planeja. Confirmado hoje por ele mesmo |
| Planejador | — | `animador-f6` | dito pelo Diretor, ainda não confirmado por `ListAgents` |
| **Manual** | MANUAL · animador-7d | `animador-7d` | escreve `documentos/manual/`, um capítulo por vez, com gesto e selo |

Caminho: `Manual → Diretor (animador-01) → Humberto`. Nenhum executor de
código está de pé nesta rodada.

## Método, aprendido no osso — 15/09/2026

Três regras de convivência entre chats. Cada uma custou tempo antes de virar
frase.

| # | Regra | O que custou |
|:---:|:---|:---|
| 1 | **A peça vive no arquivo, não na janela.** O que vai por mensagem é o resumo; o detalhe fica num documento em `documentos/planos/` | Uma janela morre no meio de uma frase e leva o briefing junto. O inventário do Spriter sobreviveu à morte do executor **porque estava em documento** — perdeu-se a cabeça fresca, não o trabalho |
| 2 | **Endereço morre a qualquer hora**, inclusive entre duas mensagens minhas | Mandei trabalho a um executor e a entrega falhou com "No agent named … is reachable". Ele existia dez minutos antes |
| 3 | **Pergunte quem é antes de dar trabalho.** Papel primeiro, lote depois | Eu quase entreguei um lote de CSS ao chat que escreve o MANUAL. Ninguém descobriria até o `fronteiras.test.ts` ficar vermelho, ou dois chats escreverem no mesmo arquivo |

## CÓDIGO CONGELADO — 15/09/2026

**`editor/src` não é tocado por ninguém** até o manual estar pronto e o Humberto
mandar voltar. Ordem dele, hoje: *"Nada de programação agora, só planejamento."*

Vale para chat novo também — principalmente para chat novo, que é quem
desobedece sem querer. Se o seu lote pede código, ele está congelado: escreva o
plano, e espere a palavra.

| Pode | Não pode |
|:---|:---|
| ler `editor/src` à vontade | escrever nele |
| escrever documento em `documentos/` | rodar `versao.py` |
| `npx vitest run`, `npx tsc --noEmit` | `npm run roteiro`, `npm run medir` (porta fixa) |

## 15/09/2026, noite — o Humberto disse: `animador-f6` É O DIRETOR

Ele falou nesta janela: *"você é o diretor"*. A janela que era PLANEJADOR virou
**DIRETOR · animador-f6**. Vale a partir de agora.

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Diretor** | DIRETOR · animador-f6 | `animador-f6` | fala com o Humberto. **Única porta que dá nele** |
| Diretor antigo | DIRETOR · animador-01 | `animador-01` | vivo e ocioso. **Não é mais a porta** — aguarda o Humberto mandar fechar |
| Planejador | — | **vago** | |
| Manual | — | **vago** | `animador-7d` morreu; conferido no `ListAgents` de hoje |
| Executores | — | **vagos** | código congelado, ninguém de pé |

Vivos no `ListAgents` de 15/09 à noite: só `animador-f6` e `animador-01`.
Todo o resto da tabela acima está morto.

## 16/09/2026 — `animador-01` arquivado

O Humberto arquivou a janela DIRETOR · animador-01. **Diretor só um:
`animador-f6`.**

## 16/09/2026 — PESQUISA 3 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Pesquisa 3 | PESQUISA 3 · Pesquisa 3: o que os usuários pedem | `Pesquisa 3: o que os usuários pedem` | escreve `documentos/planos/O QUE OS USUARIOS PEDEM 2026-09-16.md` |

## 16/09/2026 — Pesquisa 1 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Pesquisador 1 | PESQUISA 1 · pesquisa-1 | `Pesquisa 1: o que ainda não temos` (o ListAgents manteve o nome antigo) | "O que ainda não temos": Spine que falta, partículas, pesquisa de fora. Responde ao DIRETOR · animador-f6 |

## 16/09/2026 — PESQUISA 4 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Pesquisa 4 | PESQUISA 4 · dd1f01 | `Pesquisa 4: os erros que não vamos repetir` (o título mudou, o endereço não — conferido no `ListAgents`) | do que os usuários reclamam: `documentos/planos/OS ERROS QUE NAO VAMOS REPETIR 2026-09-16.md` |

Vivos no `ListAgents` desta hora: DIRETOR · animador-f6 e as Pesquisas 1, 2 e 3.

## 16/09/2026 — PESQUISA 2 assina

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Pesquisador 2 | PESQUISA 2 · efeito | `Pesquisa 2: como se faz efeito` (conferido no `ListAgents` de 16/09; a janela foi renomeada, o endereço pode passar a ser o título novo — confira) | escreve `documentos/planos/COMO SE FAZ EFEITO 2026-09-16.md`. Responde ao DIRETOR · animador-f6 |

## 16/09/2026 — PLANEJADOR assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Planejador** | PLANEJADOR · animador-17 | `Abrir o PLANEJADOR do Recorte` (ref `17c895`; o título mudou, o endereço não — conferido no `ListAgents`) | escreve os planos; junta as quatro pesquisas. Responde ao DIRETOR · animador-f6 |

## 16/09/2026 — o endereço do Diretor mudou

`DIRETOR · animador-f6` deixou de responder. No `ListAgents` a mesma janela (ref `5494c3`) agora se chama **`DIRETOR`**. Escreva para `DIRETOR`. — PLANEJADOR

## 16/09/2026 — o nome da janela mudou (regras 22 e 23 do `CLAUDE.md`)

| Quem | Título da janela |
|:---|:---|
| Diretor | `DIRETOR · animador-f6` |
| Planejador | `PLANEJADOR · animador-17` (endereço de mensagem: `Abrir o PLANEJADOR do Recorte`) |
| Pesquisa | `PESQUISA · o que pesquisa` |
| Executor | `EXECUTANDO · o que executa` |

**Nenhum chat abre painel de pergunta.** Trava o chat. Dúvida sobe por mensagem.

## 16/09/2026 — o PLANEJADOR administra os chats

Ordem do Humberto, passada pelo DIRETOR. **Todo chat reporta ao PLANEJADOR**, nunca ao Diretor.

| Quem | Faz |
|:---|:---|
| **PLANEJADOR** · `Abrir o PLANEJADOR do Recorte` | abre os chats, escreve os encargos, recebe os relatórios, diz quando arquivar |
| **DIRETOR** · `DIRETOR` | discute ideias com o Humberto. Do Planejador recebe só: decisão pronta, lote fechado, dúvida que só o Humberto resolve |

Caminho: `Pesquisa/Executor → PLANEJADOR → DIRETOR → Humberto`.

**As 4 pesquisas de 16/09 terminaram.** Os quatro documentos estão em `documentos/planos/` e foram juntados em `AS QUATRO PESQUISAS - lista unica 2026-09-16.md`. Podem ser arquivadas.

## 16/09/2026 — PESQUISA · Alinhamento de imagens com pivô assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Pesquisa | ~~PESQUISA · Alinhamento de imagens com pivô~~ → **PESQUISA · peles em bloco** | `PESQUISA · peles em bloco [b9c706]` (era `PESQUISA · Alinhamento de imagens com pivô`, mesmo endereço) | terminou o pivô (pivô automático por PSD confirmado; troca de mão por pasta já existia). Agora: peles em bloco estilo Dota 2 — Character Maps x Skin bones, achado que já existe hoje. O Humberto fala direto nesta janela. Responde ao PLANEJADOR |

## 16/09/2026 — PESQUISA · Alinhamento de imagens com pivô terminou

Disse "pronto para arquivar". Os achados estão no fim de `documentos/planos/AS QUATRO PESQUISAS - lista unica 2026-09-16.md`. Pode ser arquivada. — PLANEJADOR

## 16/09/2026 — correção: a pesquisa do pivô NÃO pode ser arquivada ainda

Depois do "pronto para arquivar", o Humberto abriu outro assunto na mesma janela (peles em bloco). Documento: `documentos/planos/PESQUISA peles - Spriter Spine e o que ja temos 2026-09-16.md`. Pela regra 22 o título dela deve passar a dizer peles. — PLANEJADOR

## 17/09/2026 — chat novo (Cowork) assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| sem papel ainda | (Cowork — não tem `set_session_title`) | `claude-c0` (ref `8a9ebe`, conferido no `ListAgents`) | abriu a pasta hoje; esperando o Humberto dizer o papel. `ListAgents` de 17/09: nenhum outro chat vivo |

## 17/09/2026 — endereços do dia, pelo PLANEJADOR

| Papel | Endereço (`SendMessage`) | Nota |
|:---|:---|:---|
| **Planejador** | `PLANEJADOR` | o endereço mudou da noite para o dia (era `Abrir o PLANEJADOR do Recorte`) |
| **Diretor** | `DIRETOR` | igual a ontem |
| janela das peles | `animador-7d` (ref `bb328c`) | nova hoje; reporta ao PLANEJADOR |

## 17/09/2026 — PESQUISA · peles assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Pesquisa | PESQUISA · peles | `animador-7d` (ref `bb328c`, conferido no `ListAgents` de 17/09) | organiza as ideias de pele do Humberto: pilha Feitas/Ativas no lugar do olho, editar na mesma janela, osso a mais (§4.1 do `PROJETO DAS PELES`). Reporta ao PLANEJADOR. Código: não toca |

Nota: a §4.1 foi mandada ao DIRETOR por pedido direto do Humberto nesta janela. Daqui para a frente, relatório vai ao PLANEJADOR.

## 17/09/2026, fim do dia — O HUMBERTO FECHA TODOS OS CHATS

| Papel | Estado |
|:---|:---|
| Diretor | fechando. O próximo assina aqui |
| Planejador | **fechou** antes do lote 3 — o Diretor aplicou o lote 3 na pasta |
| Pesquisas e executores | todos fechados |

**Para quem chegar:** o trabalho está em `documentos/programa-novo/`. Comece pelo
`00 LEIA PRIMEIRO.md`. Pergunta aberta: só a Q42, que não trava. A obra começa
no degrau 1 do `13` (formato e runtime). O código **continua congelado** até o
Humberto dizer "pode programar".

## 17/09/2026 — ARQUITETO assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Arquiteto** | ARQUITETO · animador-8b | `animador-8b` (ref `e36718`, conferido no `ListAgents` de 17/09) | leu todo o material; diagnose, triagem, spec e tarefas em `documentos/planos/ARQUITETO 1..4 … 2026-09-17.md`. Não escreve código. Fala direto com o Humberto nesta janela |

`ListAgents` de 17/09, 05:24: além desta janela, só `DIRETOR [0c0128]` vivo neste projeto (ocioso). O Humberto pediu para arquivar os outros chats do projeto quando o plano estiver pronto.

## 17/09/2026, noite — o ARQUITETO arquivou os chats do projeto

Arquivados (14): PLANEJADOR · PESQUISA peles · as 4 PESQUISAS de 16/09 · MANUAL 7d · LINHA DO TEMPO 97 e 47 · CHAVE PARENT c1 · PESQUISA d4 · LEVANTAMENTOS 4b · 4 A malha · 1 A caixa.

**Não arquivado:** `DIRETOR` (`local_c209de8c…`) — tem um cliente de Remote Control ligado; o aplicativo recusou. O Humberto arquiva pela barra lateral quando quiser.

Vivo neste projeto: só **ARQUITETO · animador-8b**.

## 17/09/2026, manhã — EXECUTANDO · degrau zero assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · degrau zero (spec 0.2) → **degrau 1** | `animador-5e` (ref `3735ba`, conferido no `ListAgents` de 17/09, 06:40) | D0 e D1 do `ARQUITETO 4`, por ordem direta do Humberto. D0: spec 0.2, glossário, casos C-290–297, exemplos sem socket, rig. D1: `offset` → `transform`, schema 0.2, validadores (núcleo + CLI com `.bonez`), casos refeitos, documentos de conformidade. **Runtime e editor congelados**: não tocou `editor/src` nem `runtime/`. Para e mostra; não começa o degrau 2 |

`ListAgents` de 17/09, 06:40: nenhum outro chat deste projeto vivo (nem `ARQUITETO · animador-8b`, nem `DIRETOR`). O Humberto fala direto nesta janela.

## 17/09/2026, manhã — a rodada dos degraus 2, 3 e 4a: o congelamento acaba, por pasta

Ordem do Humberto nesta janela. **A janela `animador-5e` passa a ser o PLANEJADOR** desta rodada (fez os degraus 0 e 1). Não há Diretor de pé: o Humberto fala direto com o Planejador.

| Papel | Janela | Endereço | Faz | Pasta que pode escrever |
|:---|:---|:---|:---|:---|
| **Planejador** | PLANEJADOR · animador-5e | `animador-5e` (ref `3735ba`) | escreveu `documentos/planos/ENCARGOS degraus 2 3 4a 2026-09-17.md`; recebe os relatórios; move os casos pendentes quando A e B passarem; roda `npm run conformidade:dois` | `documentos/`, `conformidade/` |
| Chat A | EXECUTANDO · runtime TS | (assina ao abrir) | degrau 2 | `runtime/`, `ferramentas/src/conformidade/` |
| Chat B | EXECUTANDO · runtime Python | (assina ao abrir) | degrau 3, **só pela spec** | `runtime-python/` |
| Chat C | EXECUTANDO · editor sem freio | (assina ao abrir) | degrau 4a | `editor/src`, `editor/testes`, `ferramentas/provas/roteiro-30.mjs` |

Caminho: `A / B / C → PLANEJADOR (animador-5e) → Humberto`. Portas fixas (roteiro e medição): **só o Chat C**. Os três em Opus. O `CÓDIGO CONGELADO` de 15/09 deixa de valer para essas três pastas, uma por chat; `formato/` e `site/` continuam parados.


## 17/09/2026, 09:14 — Chat C assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat C | EXECUTANDO · editor sem freio | `EXECUTANDO · editor sem freio` (ref `ba6f69`, conferido no `ListAgents` de 17/09, 09:14; o endereço era `Executar degrau 4a: o editor sem freio` antes do título mudar — se um falhar, tente o outro) | degrau 4a: editar sempre grava, sai o semáforo, nenhuma ferramenta some, o tocador nunca apaga. Só `editor/src`, `editor/testes`, `roteiro-30.mjs`. Reporta ao PLANEJADOR `animador-5e` |

`ListAgents` de 17/09, 09:14: vivos neste projeto `animador-5e` (PLANEJADOR), `Executar degrau 2: runtime TypeScript no 0.2` (Chat A) e `Executar degrau 3: runtime Python só pela spec` (Chat B).

## 17/09/2026, 09:20 — Chat A assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat A | EXECUTANDO · runtime TS | `EXECUTANDO · runtime TS` (ref `c41ca1`, conferido no `ListAgents` de 17/09, 09:14; antes do título era `Executar degrau 2: runtime TypeScript no 0.2` — se um falhar, tente o outro) | degrau 2: runtime TypeScript no 0.2. Só `runtime/`, `runtime/testes/`, `ferramentas/src/conformidade/`. Reporta ao PLANEJADOR `animador-5e` |

## 17/09/2026 — Chat B assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat B | EXECUTANDO · runtime Python | `Executar degrau 3: runtime Python só pela spec` (ref `da825c`, conferido no `ListAgents` de 17/09) | degrau 3: `runtime-python/` só pela spec 0.2. Reporta ao PLANEJADOR · animador-5e |

## 17/09/2026, tarde — a rodada dos degraus 2, 3 e 4a fechou

| Papel | Estado |
|:---|:---|
| Chat A, `EXECUTANDO · runtime TS` | fechou a v13.7 e parou. **Pode ser arquivado** |
| Chat B, `EXECUTANDO · runtime Python` | fechou a v13.4 e parou. **Pode ser arquivado** |
| Chat C, `EXECUTANDO · editor sem freio` | fechou a v13.5 e parou. **Pode ser arquivado** |
| Planejador, `PLANEJADOR · animador-5e` | fechou a rodada na v13.8: 71 casos nos dois runtimes, confronto sem diferença. Fica de pé para a próxima ordem |

O congelamento por pasta (manhã de 17/09) **acabou**: as três pastas foram entregues. O próximo degrau (D4b) abre com a palavra do Humberto.

## 17/09/2026, 17:15 — EXECUTANDO · degrau 4b assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · degrau 4b: o projeto de vários corpos | `animador-8a` (ref `dbf0ac`, conferido no `ListAgents` de 17/09, 17:14) | degrau 4b (`ARQUITETO 4`): o documento vira projeto (`Projeto` com vários `Doc`, uma pilha de desfazer), as listas Corpos e Entidades no `manifest.extras.RECORTE_projeto`, abrir pasta com `manifest.json`, o corpo do instante pelo `Actor` do runtime na cena, na Árvore, na Ordem e nas Propriedades, o comando **Colar corpo aqui**, e a mexida estrutural indo para a base do corpo do instante. Só `editor/src`, `editor/testes` e os arquivos de passagem. **Não toca** `runtime/` nem `runtime-python/`. Ordem direta do Humberto nesta janela; para e mostra |

`ListAgents` de 17/09, 17:14: vivos neste projeto `animador-5e` (o PLANEJADOR da rodada anterior, ocioso) e os três chats A, B e C da rodada fechada (ociosos, podem ser arquivados).

## 17/09/2026, fim da tarde — o degrau 4b fechou a v13.9 e parou

`EXECUTANDO · degrau 4b` (`animador-8a`) fechou a **v13.9**: o documento virou projeto, a virada de corpo está na tela, Colar corpo aqui no menu Animação. Editor 2.017, suíte 2.995, roteiro 14/14, medição 22/22 e 15/22, `programa/` montado. Plano e desvios em `documentos/planos/DEGRAU 4b - o projeto de varios corpos 2026-09-17.md`. **Parado, esperando o Humberto.** Os próximos (D5 ∥ D6 ∥ D7) abrem com a palavra dele.

## 17/09/2026, noite — a rodada dos degraus 5, 6 e 7 abre (três chats em `editor/src` ao mesmo tempo)

Ordem do Humberto ao PLANEJADOR (`animador-5e`), depois do fecho do degrau 4b (v13.9, conferido: suíte 2.995, `tsc` limpo, 71/71). Encargos em `documentos/planos/ENCARGOS degraus 5 6 7 2026-09-17.md`.

| Papel | Janela | Endereço | Parte |
|:---|:---|:---|:---|
| **Planejador** | PLANEJADOR · animador-5e | `animador-5e` | escreve os encargos, recebe os relatórios, **dá o "pode" das portas** (roteiro e medição, um de cada vez) |
| Chat D5 | EXECUTANDO · janela Animação | (assina ao abrir) | `panels/animations*`, `panels/palette*` |
| Chat D6 | EXECUTANDO · linha do tempo | (assina ao abrir) | `panels/dopesheet*`, `panels/graph.ts`, `anim/timeline-tools.ts`, `anim/keying.ts` |
| Chat D7 | EXECUTANDO · cena, árvore e malha | (assina ao abrir) | `viewport/`, `panels/tree*`, `panels/mesh*`, `commands/create-bone.ts`, `commands/reparent.ts`, `mesh-doc.ts` |

Arquivos de passagem (`contract.ts`, `main.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`): só acrescentando, relendo do disco antes de gravar. O chat do degrau 4b (`animador-8a`) e os três da rodada anterior estão parados e **podem ser arquivados**.


## 17/09/2026, 18:35 — Chat D6 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat D6 | EXECUTANDO · linha do tempo | `EXECUTANDO · linha do tempo` (ref `efd3e1`, conferido no `ListAgents` de 17/09, 18:35; antes do título era `Executar degrau 6: a linha do tempo` — se um falhar, tente o outro) | degrau 6: Ctrl+clique soma, Ctrl+arrastar clona, Shift sai; arrastar move só a chave; a linha da virada; a faixa da entidade com botão direito; linhas `slot/bone` e `weights`; chave de sequência. Só `panels/dopesheet*`, `panels/graph.ts`, `anim/timeline-tools.ts`, `anim/keying.ts` e os arquivos de passagem. **Não toca** `runtime/`. Reporta ao PLANEJADOR `animador-5e` |

`ListAgents` de 17/09, 18:35: vivos neste projeto `animador-5e` (PLANEJADOR), `animador-8a` (degrau 4b, ocioso), `Executar degrau 5: a janela Animação` (D5), `Executar degrau 7: cena, árvore, malha e pivô` (D7), e os três da rodada anterior (ociosos).

## 17/09/2026, 18:35 — Chat D7 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat D7 | EXECUTANDO · cena, árvore e malha | `EXECUTANDO · cena, árvore e malha` (ref `6617a9`, conferido no `ListAgents` de 17/09, 18:35; antes do título era `Executar degrau 7: cena, árvore, malha e pivô` — se um falhar, tente o outro) | degrau 7: B cria osso, Y posa, N livre; pendurar cria tomada; troca de osso por chave no Virar filho; ferramenta Malha (caixa, máscara, caminho); botão direito; Chavear pesos; forma e pesos para a base do corpo do instante. Só `viewport/`, `panels/tree*`, `panels/mesh*`, `commands/create-bone.ts`, `commands/reparent.ts`, `mesh-doc.ts` e passagem. **Não toca** `runtime/`. Reporta ao PLANEJADOR `animador-5e` |

`ListAgents` de 17/09, 18:35: vivos neste projeto `animador-5e` (PLANEJADOR), `animador-8a` (degrau 4b, ocioso), D5 `Executar degrau 5: a janela Animação` e D6 `Executar degrau 6: a linha do tempo` (ocupados), e os três chats A, B, C da rodada anterior (ociosos).

## 17/09/2026, 18:40 — Chat D5 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat D5 | EXECUTANDO · janela Animação | `EXECUTANDO · janela Animação` (ref `68f9be`, conferido no `ListAgents` de 17/09, 18:35; antes do título era `Executar degrau 5: a janela Animação` — se um falhar, tente o outro) | degrau 5: a janela Animação com Corpos em cima e Animações do corpo embaixo; clicar no corpo sem animação abre a base; Salvar como base nova; Promover e rebaixar entidade ⇄ corpo; painel Entidades ao lado do Imagens, miniatura parada. Só `panels/animations*`, `panels/palette*`, `doc/projeto.ts` (acrescentando) e os arquivos de passagem. **Não toca** `runtime/`, `runtime-python/`, `formato/`, `site/`, `documentos/manual/`. Reporta ao PLANEJADOR `animador-5e` |

## 18/09/2026, madrugada — o degrau 5 fechou a v14.3 e a v14.5, e parou

`EXECUTANDO · janela Animação` (Chat D5) fechou os dois lotes: a janela Animação
com **Corpos em cima e Animações do corpo embaixo**, clicar no corpo abre a base
dele, **Salvar como base nova**, **Promover e rebaixar**, e o painel
**Entidades** ao lado do Imagens, com miniatura parada.

Suíte **3.119** (3.089 verdes, 29 pulados, 1 vermelho antigo do manual, 15/09) ·
`tsc` limpo · conformidade 71/71 · roteiro **14/14** · medição **24/24** de lado
e **17/24** de altura · `programa/` montado. Plano e desvios em
`documentos/planos/ENCARGOS degraus 5 6 7 2026-09-17.md`, seção Chat D5.

**Duas armadilhas achadas no caminho, escritas para quem vier:**

| O quê | A regra que fica |
|:---|:---|
| O painel novo aparecia no menu Janela e **não nascia na coluna** | A arrumação de fábrica é o `RIGHT_GROUPS` do `ui/layout-model.ts`, não os grupos do `panel-groups.ts`. **Painel novo precisa de uma linha lá**, senão a prova `npm run medir` nem o mede |
| A **v14.4 chegou a existir duas vezes** | O `versao.py` só recusa repetido quando o NOME do arquivo bate, e o nome leva a data. Passou da meia-noite e o número escapou. Confira o NÚMERO no `INDICE.md` antes de gravar, sobretudo virando o dia |

**Parado, esperando o Humberto.**

## 18/09/2026, madrugada — a rodada dos degraus 5, 6 e 7 fechou

| Papel | Estado |
|:---|:---|
| D5, `EXECUTANDO · janela Animação` | fechou v14.3 e v14.5 e parou. **Pode ser arquivado** |
| D6, `EXECUTANDO · linha do tempo` | fechou v14.0, v14.2 e v14.4 e parou. **Pode ser arquivado** |
| D7, `EXECUTANDO · cena, árvore e malha` | fechou v14.1 e v14.6 e parou. **Pode ser arquivado** |
| Planejador, `PLANEJADOR · animador-5e` | fechou a rodada na v14.7. Fica de pé para a próxima ordem |

Também parados e arquiváveis: o chat do degrau 4b (`animador-8a`) e os três da rodada 2/3/4a. O próximo degrau (D8 ∥ D9 ∥ D10) abre com a palavra do Humberto.

## 18/09/2026, 03:00 — Chat D8 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat D8 | EXECUTANDO · imagens, ordem e entidades | `EXECUTANDO · imagens, ordem e entidades` (ref `99897f`, conferido no `ListAgents` de 18/09, 02:58; antes do título era `Executar degrau 8: imagens, ordem e entidades` — se um falhar, tente o outro) | degrau 8: a grade do botão direito lista entidades e trocar por entidade herda osso, pivô, ordem e chaves; Copiar a ordem chave a chave; Trocar pasta de origem; alinhar pela guia do PSD; painel Pivôs; pasta numerada vira sequência. Só `panels/palette*`, `image-picker.ts`, `image-grid-model.ts`, `pivot-model.ts`, `pivot-dialog.ts`, `draw-order-model.ts`, `panels/draw-order*`, `io/project-folder.ts`, `ferramentas/src/importar/psd.ts` e passagem. **Não toca** `runtime/`. Reporta ao PLANEJADOR `animador-5e` |

`ListAgents` de 18/09, 02:58: vivos neste projeto `animador-5e` (PLANEJADOR, ocupado), `animador-8a` (4b, ocioso), D5, D6, D7 e os três da rodada 2/3/4a (ociosos). D9 e D10 ainda não apareceram na lista.

## 18/09/2026 — a rodada dos degraus 8, 9 e 10 abre

Ordem do Humberto ("continue") ao PLANEJADOR (`animador-5e`). Encargos em `documentos/planos/ENCARGOS degraus 8 9 10 2026-09-18.md`.

| Papel | Janela | Endereço | Parte |
|:---|:---|:---|:---|
| **Planejador** | PLANEJADOR · animador-5e | `animador-5e` | encargos, relatórios, o "PODE" das portas |
| Chat D8 | EXECUTANDO · imagens, ordem e entidades | (assina ao abrir) | `panels/palette*`, `image-picker`, `image-grid-model`, `pivot-*`, `draw-order*`, `project-folder`, `psd.ts` |
| Chat D9 | EXECUTANDO · peles | (assina ao abrir) | `panels/skins*`, `skins-model`, `skins-actions`, `onion`, `rules-model`, `properties-model`, `io/export-skin` |
| Chat D10 | EXECUTANDO · arquivo | (assina ao abrir) | `shell-file`, `io/open-save`, `io/folder-save`, `drop-plan`, `export-image`, `export-gltf`, `importar/spriter.ts` |

Portas: um de cada vez, pelo "PODE" do Planejador. Modelos: Opus. Os sete chats das rodadas anteriores continuam arquiváveis.


## 18/09/2026, 03:00 — Chat D9 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat D9 | EXECUTANDO · peles | `EXECUTANDO · peles` (ref `7f2eb4`, conferido no `ListAgents` de 18/09, 03:00; antes do título era `Executar degrau 9: peles` — se um falhar, tente o outro) | degrau 9: Feitas e Ativas no lugar do olho, a pilha e a pele em edição separadas, um lápis só com sinal na Árvore e na cena, fazer a pele como o Spriter, Exportar e Importar pele, Promover pele a base, `keepSkins` na ficha da chave `body`, e os defeitos A4, A5, A6. Só `panels/skins*`, `skins-model.ts`, `skins-actions.ts`, `onion.ts`, `rules-model.ts`, `properties-model.ts`, `io/export-skin.ts` e passagem. **Não toca** `runtime/`. Reporta ao PLANEJADOR `animador-5e` |

`ListAgents` de 18/09, 03:00: vivos neste projeto `animador-5e` (PLANEJADOR), D8 `Executar degrau 8: imagens, ordem e entidades` e D10 `Executar degrau 10: arquivo, exportar e importar` (ocupados).

## 18/09/2026, 03:00 — Chat D10 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat D10 | EXECUTANDO · arquivo | `EXECUTANDO · arquivo` (ref `5e0ad0`, conferido no `ListAgents` de 18/09, 03:00; antes do título era `Executar degrau 10: arquivo, exportar e importar` — se um falhar, tente o outro) | degrau 10: Novo, Abrir e Salvar falam de projeto e corpo; Salvar grava a pasta inteira; Salvar como pacote (`.bonez`); Entregar um corpo; abrir outro `.bone` como corpo ou entidade; Novo / Por cima; exportar imagem com borda automática ou `crop` (retângulo magenta); importador do Spriter faz projeto; glTF recebe um corpo. Só `shell-file.ts`, `io/open-save.ts`, `io/folder-save.ts`, `drop-plan.ts`, `export-image.ts`, `export-gltf.ts`, `ferramentas/src/importar/spriter.ts` e passagem. **Não toca** `runtime/`. Reporta ao PLANEJADOR `animador-5e` |

`ListAgents` de 18/09, 03:00: vivos neste projeto `animador-5e` (PLANEJADOR), D8 `Executar degrau 8: imagens, ordem e entidades` e D9 `Executar degrau 9: peles` (ocupados).

## 18/09/2026, manhã — os endereços mudaram outra vez, pelo Chat D10

O aplicativo reiniciou no meio da rodada dos degraus 8, 9 e 10: `animador-5e`
parou de responder no `SendMessage` ("No agent named … is reachable"), e as
três janelas de execução ganharam nome novo. Conferido no `ListAgents` de
18/09, 07:55.

| Papel | Janela | Endereço de agora |
|:---|:---|:---|
| **Planejador** | PLANEJADOR · animador-5e | `PLANEJADOR · animador-5e` (era `animador-5e`) |
| Chat D8 | EXECUTANDO · imagens, ordem e entidades | `EXECUTANDO · imagens, ordem e entidades` |
| Chat D9 | EXECUTANDO · peles | `EXECUTANDO · peles` |
| Chat D10 | EXECUTANDO · arquivo | `EXECUTANDO · arquivo` |

**O título da janela virou o endereço** nos três executores e no Planejador.
É a regra 19 valendo na prática: quem vai escrever para alguém roda o
`ListAgents` antes, e corrige esta tabela quando o endereço mudar.

## 18/09/2026, manhã — a rodada dos degraus 8, 9 e 10 fechou

| Papel | Estado |
|:---|:---|
| D8, `EXECUTANDO · imagens, ordem e entidades` | fechou v15.0, v15.3 e v15.7 e parou. **Pode ser arquivado** |
| D9, `EXECUTANDO · peles` | fechou v14.9, v15.1, v15.4 e v15.5 e parou. **Pode ser arquivado** |
| D10, `EXECUTANDO · arquivo` | fechou v14.8, v15.2 e v15.6 e parou. **Pode ser arquivado** |
| Planejador, `PLANEJADOR · animador-5e` | fechou a rodada na v15.8. Fica de pé para a próxima ordem |

Feitos os degraus D0 a D10 do `ARQUITETO 4`. O próximo é o **D11 (casca)**, que o Humberto quer fazer **vendo**: abre só com a palavra dele.

## 18/09/2026 — o degrau 11 (a casca) abre, um chat só

Ordem do Humberto ("continue até terminar") ao PLANEJADOR (`PLANEJADOR · animador-5e`). Encargo em `documentos/planos/ENCARGO degrau 11 - a casca 2026-09-18.md`.

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Planejador** | PLANEJADOR · animador-5e | `PLANEJADOR · animador-5e` | encargo, relatório, fecho; depois o D12 |
| Executor | EXECUTANDO · a casca | (assina ao abrir) | D11: um lote, uma versão e uma foto por mudança visível. Sozinho no editor |

Os três chats da rodada 8/9/10 estão parados e arquiváveis.


## 18/09/2026, 09:10 — EXECUTANDO · a casca assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor D11 | EXECUTANDO · a casca | `EXECUTANDO · a casca` (ref `05190b`, conferido no `ListAgents` de 18/09, 09:08; antes do título era `Executar degrau 11: a casca` — se um falhar, tente o outro) | degrau 11, a casca: o interruptor sai e o rodapé diz onde se está; trocar as teclas; colar na quina; arranjos com nome; tela cheia da Visualização; Janela de Problemas; rascunho e recuperar; a medição mede painel cheio. Um lote, uma versão e um par de fotos por mudança. Sozinho no editor. **Não toca** `runtime/`, `runtime-python/`, `formato/`, `site/`, `documentos/manual/`. Reporta ao PLANEJADOR `PLANEJADOR · animador-5e` |

`ListAgents` de 18/09, 09:08: vivos neste projeto `PLANEJADOR · animador-5e` (ocioso) e os três da rodada 8/9/10 (ociosos, arquiváveis).

## 18/09/2026 — passagem de bastão do Planejador

A janela `PLANEJADOR · animador-5e` ficou comprida demais (dois dias, doze degraus). O Humberto pediu um chat novo para o papel. O mapa está em `documentos/planos/PASSAGEM DE BASTAO do planejador 2026-09-18.md`.

| Papel | Estado |
|:---|:---|
| Planejador antigo, `PLANEJADOR · animador-5e` | fica de pé **só até o novo assinar aqui e avisar**; depois se cala e pode ser arquivado |
| Planejador novo | (assina ao abrir, com o endereço dele) |
| Executor do D11, `EXECUTANDO · a casca` | rodando, em Opus; o lote 1 fechou a v16.0. Passa a reportar ao Planejador novo assim que ele avisar |


## 18/09/2026, 10:06 — o PLANEJADOR novo assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Planejador** | PLANEJADOR · dd3937 | `PLANEJADOR · dd3937` (ref `dd3937`, conferido no `ListAgents` de 18/09, 10:06; antes do título era `Assumir o papel de PLANEJADOR do Recorte` — se um falhar, tente o outro) | assume o papel pela passagem de bastão: recebe os relatórios do D11, confere o fecho no disco, escreve o encargo do D12 e abre as fichas. Não escreve código do editor nem do runtime. O Humberto fala direto nesta janela |
| Planejador antigo | PLANEJADOR · animador-5e | `PLANEJADOR · animador-5e` | avisado; se cala. **Pode ser arquivado** |
| Executor D11 | EXECUTANDO · a casca | `EXECUTANDO · a casca` (ref `05190b`) | rodando; seis lotes fechados (v16.0 a v16.5). Reporta a `PLANEJADOR · dd3937` |

Caminho: `Executor → PLANEJADOR (PLANEJADOR · dd3937) → Humberto`.

## 18/09/2026, 10:20 — correção: quem fecha o D11, quem faz o D12

Ordem do Humberto, passada por `PLANEJADOR · animador-5e`: *"você termina essa
rodada, mas a próxima rodada é o próximo chat"*.

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Planejador desta rodada (D11)** | PLANEJADOR · animador-5e | `PLANEJADOR · animador-5e` | fecha o degrau 11 e se cala. O `EXECUTANDO · a casca` reporta **a ele** até o fim |
| **Planejador da próxima rodada (D12)** | PLANEJADOR · dd3937 | `PLANEJADOR · dd3937` | escreve `documentos/planos/ENCARGOS degrau 12 - o glace 2026-09-18.md` agora; **não abre ficha nenhuma** e não roda roteiro nem medição até a frase "D11 fechado" chegar do `animador-5e` |

Ninguém grava em `editor/src` enquanto a casca está em obra.

## 18/09/2026, fim da manhã — o degrau 11 fechou (v16.0 a v16.7)

`EXECUTANDO · a casca` fez os oito lotes, um por mudança visível, cada um com
versão e par de fotos. Suíte 3.340, `tsc` limpo, 71/71, roteiro 14/14, medição
26/26 e 19/26 **com os painéis cheios**, `programa/` montado.

| Papel | Estado |
|:---|:---|
| Executor, `EXECUTANDO · a casca` | fechou v16.0 a v16.7 e parou. **Pode ser arquivado** |
| Planejador desta rodada | `PLANEJADOR · animador-5e` — recebe o relatório do D11 |
| Planejador da próxima rodada (D12) | `PLANEJADOR · dd3937`, por ordem do Humberto |

Nota de convivência, 18/09: duas janelas de Planejador escreveram ao executor
no meio do degrau, com ordens diferentes sobre a quem reportar. A regra que
ficou: **quem abriu a rodada a fecha**; o chat novo assume na rodada seguinte.

## 18/09/2026, 10:45 — o degrau 11 fechou; o bastão passou

| Papel | Estado |
|:---|:---|
| `EXECUTANDO · a casca` | fechou v16.0 a v16.8 e parou. **Pode ser arquivado** |
| `PLANEJADOR · animador-5e` | conferiu o D11 (v16.9), mandou "D11 fechado" e **se cala**. **Pode ser arquivado** |
| **`PLANEJADOR · dd3937`** | **é o Planejador a partir de agora.** Abre o D12 |

## 18/09/2026, 11:00 — o degrau 11 fechou; a rodada R1 do degrau 12 abre

O `PLANEJADOR · animador-5e` fechou o D11 na **v16.9** e se calou. O bastão é do
`PLANEJADOR · dd3937`, que conferiu a linha de base **ele mesmo, com a casa
vazia**: suíte 3.340 (3.310 verdes, 29 pulados, 1 vermelho antigo do manual),
`tsc` limpo, 71/71 nos dois runtimes.

Encargo: `documentos/planos/ENCARGOS degrau 12 - o glace 2026-09-18.md`.
As fichas dos três chats estão escritas no apêndice dele.

| Papel | Janela | Endereço | Parte (cerca) |
|:---|:---|:---|:---|
| **Planejador** | PLANEJADOR · dd3937 | `PLANEJADOR · dd3937` | encargos, relatórios, o **"PODE"** das portas fixas, os fechos |
| Chat `P1` | EXECUTANDO · particulas no formato | (assina ao abrir) | `formato/`, `conformidade/`, `ferramentas/src/validador/` |
| Chat `B` | EXECUTANDO · biblioteca de animacoes | (assina ao abrir) | `editor/src/io/`, `panels/animations*`, `formato/rigs/` (só acrescentar) |
| Chat `C` | EXECUTANDO · as portas do formato | (assina ao abrir) | `panels/properties*`, `panels/rules*`, `event-key-editor`, `anim/event-keys`, `anim/keying`, `tree-commands` (só acrescentar), `ui/prefs` |

As três cercas **não se cruzam em nenhum arquivo**. Portas fixas (roteiro 5191,
medição 9335): um de cada vez, pelo "PODE" do Planejador. Os três em **Opus**.

Parados e arquiváveis quando o Humberto mandar: `EXECUTANDO · a casca`,
`PLANEJADOR · animador-5e`, e os três da rodada 8/9/10.

**Pergunta aberta ao Humberto** (do executor da casca, subida em 18/09): as
teclas de painel (linha do tempo, Ordem, Árvore) entram na janela Ajuda →
Atalhos? Elas já trocam pelo mesmo sistema; pô-las na lista a dobra de tamanho.

## 18/09/2026, 10:58 — Chat `P1` assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat `P1` | EXECUTANDO · particulas no formato | `EXECUTANDO · particulas no formato` (ref `022bc5`, conferido no `ListAgents` de 18/09, 10:57; antes do título era `Executar D12/P1: partículas no formato` — se um falhar, tente o outro) | degrau 12, parte 1: a extensão `BONE_particles` no formato (spec própria + JSON Schema + linha no `REGISTRY.md`), os cinco avisos do validador e o `extensionsUsed`/`extensionsRequired`, e os casos P-001 a P-008 em `conformidade/casos-pendentes/`. Só `formato/`, `conformidade/`, `ferramentas/src/validador/`. **Não toca** `editor/`, `runtime/`, `runtime-python/`, `site/`, `documentos/manual/`. Reporta ao `PLANEJADOR · dd3937` |

`ListAgents` de 18/09, 10:57: vivos neste projeto `PLANEJADOR · dd3937`, `EXECUTANDO · a casca` (ocioso), os três da rodada 8/9/10 (ociosos), e os dois irmãos desta rodada — `Executar D12/B: biblioteca de animações` (ref `efaf6d`) e `Executar D12/C: as portas do formato` (ref `d296af`), ainda com o nome de abertura.

## 18/09/2026, 11:00 — chat `C` do degrau 12 assinou

| Papel | Janela | Endereço | Parte (cerca) |
|:---|:---|:---|:---|
| Chat `C` (executor) | EXECUTANDO · as portas do formato | `EXECUTANDO · as portas do formato [d296af]` | `panels/properties*`, `panels/rules*`, `panels/event-key-editor`, `anim/event-keys`, `anim/keying`, `tree-commands` (só acrescentar), `ui/prefs` |

Quatro lotes, um por porta: Sliders · Áudio · Física · Variáveis e tags.
Reporta ao `PLANEJADOR · dd3937`. Não toca `runtime/`, `formato/`, `viewport/`,
`io/`, `panels/animations*`.

## 18/09/2026, 12:52 — chat `B` do degrau 12 assinou

| Papel | Janela | Endereço | Parte (cerca) |
|:---|:---|:---|:---|
| Chat `B` (executor) | EXECUTANDO · biblioteca de animacoes | `EXECUTANDO · biblioteca de animacoes` (ref `efaf6d`, conferido no `ListAgents` de 18/09, 10:57; antes do título era `Executar D12/B: biblioteca de animações` — se um falhar, tente o outro) | `editor/src/io/` (o arquivo novo), `editor/src/panels/animations*`, `formato/rigs/` (só acrescentar as animações de fábrica) |

Dois lotes: (1) Exportar animação e Importar animação, espelhando
`io/export-skin.ts`; (2) as animações de fábrica — parado, andar, correr,
pular — contra o `humanoide-v1`, e onde elas aparecem na janela Animação.
Passagem, só acrescentando: `ui/actions-table.ts`, `ui/menus.ts`, `ui/keys.ts`,
`CHANGELOG.md`, `ESTADO.md`, `backup/INDICE.md`. Reporta ao `PLANEJADOR · dd3937`.
Não toca `runtime/`, `runtime-python/`, o resto de `formato/`, `viewport/`,
`panels/skins*`, `panels/properties*`, `panels/rules*`, `site/`,
`documentos/manual/`.

## 18/09/2026, tarde — a parte `B` (biblioteca de animações) fechou

| Lote | Versão | O quê |
|:---:|:---|:---|
| 1 | **v17.0** | Exportar animação e Importar animação, com o `rig` gerado do conteúdo e a lista do que falta **antes** de aplicar |
| 2 | **v17.3** | as quatro de fábrica — parado, andar, correr, pular — em `formato/rigs/humanoide-v1-animacoes.bone` (arquivo novo; o `humanoide-v1.bone` **não mudou**) |

Conferido no disco pelo Planejador: os quatro zips (v17.0 a v17.3), as quatro
animações dentro do arquivo novo, o `rig` citando 14 ossos, e
`editor/src/io/animation-library.ts`. Suíte relatada: 3.426 (1 vermelho, o do
manual). **Roteiro e medição não foram rodados** — o "PODE" não saiu, porque o
chat `C` está gravando no editor.

**O chat `EXECUTANDO · biblioteca de animacoes` parou e pode ser arquivado**
quando o Humberto mandar.

Duas coisas que ficam como exemplo para quem vier:

| O quê | Por quê |
|:---|:---|
| A seção "De fora" **escreve que não sabe**: mostra `?` e a palavra "não aberto" quando o `.bone` cita um arquivo externo que o editor não abriu | `assets.animations` guarda uris, não nomes. Mostrar zero pareceria uma importação que não pegou — regra 21 |
| As quatro de fábrica foram **provadas de verdade**: validador, `rig` completo, zero `RIG_UNMET`, o runtime as junta, as poses se mexem, e três delas fecham o ciclo | Caso de conformidade não cobre o que o projeto **publica**. Um ciclo que não fecha dá um tranco a cada volta |

## 18/09/2026, tarde — a parte `P1` (partículas no formato) fechou

| Lote | Versão | O quê |
|:---:|:---|:---|
| 1 | **v17.1** | A spec da extensão `BONE_particles`, o JSON Schema, o exemplo, a convenção e a linha no `REGISTRY.md`. **O schema de extensão passou a ser aplicado pelo nome** nos dois validadores |
| 2 | **v17.2** | Os cinco códigos de partícula no validador, mais `extensionsUsed`/`extensionsRequired` |
| 3 | **v17.4** | Os oito casos P-001 a P-008, em `casos-pendentes/` |
| 4 | **v17.5** | O validador confere o `rig` (§4.8): `RIG_UNMET`, `RIG_INCOMPLETE` (que nem estava na tabela da §12.3) e `RIG_REFERENCE`, que também faltava |
| 4b | **v17.6** | O `RIG_INCOMPLETE` passou a valer **também em arquivo solto**, depois de medido |

Conferido no disco pelo Planejador: os zips, `formato/extensions/BONE_particles.md`
(35 KB) e `.schema.json`, os oito casos, e o `rig` do
`humanoide-v1-animacoes.bone` inteiro (o osso plantado para o teste foi
devolvido). **O chat parou e pode ser arquivado.**

### Três coisas desta parte que ficam como método

| O quê | Por quê |
|:---|:---|
| **O validador dava verde para lixo.** Um emissor com `rate: -5`, `shape: "triangulo"`, `seed: -1` passava nos dois validadores, porque o schema de uma extensão nunca era consultado. Agora o `checarExtensoes` o aplica pelo nome, e **o schema diz de si mesmo o que descreve** (`x-extension`, `x-attachment-types`): extensão nova entra sem uma linha de código | §12.7 já mandava, e ninguém tinha feito |
| **Escrever os casos rendeu TRÊS linhas novas à spec** — quantos nascimentos tem uma volta (achado quando o P-003 deu 24 e 23), o que a matriz do osso leva junto e em que instante, e o formato do dump | É a regra de empate agindo **antes** de custar um caso, e não depois, como custou o C-299 e o C-300 |
| **"Zero, sozinho, não prova nada."** A regra nova do `rig` não acusou nenhum dos 110 arquivos do projeto — então o executor **plantou o defeito de propósito** (tirou um osso do `rig` sem tirar a timeline), viu a regra acusar, e devolveu o arquivo. A medição ficou **presa em teste** que varre o projeto e diz qual arquivo, não num documento que envelhece | Uma regra que nunca acusa nada também dá zero. É a regra 21 aplicada à própria prova — a terceira cara, a que engana a nós |

**A conta que pega o defeito:** osso `skinRequired` e slot local **se descontam** (viajam com a pele); **osso comum não se desconta**, porque os `bones` de um arquivo de animações são ignorados na importação — o arquivo parece são sozinho e chega quebrado no hospedeiro. Era esse o buraco.

## 18/09/2026, 13:45 — chat `P3` do degrau 12 assinou

| Papel | Janela | Endereço | Parte (cerca) |
|:---|:---|:---|:---|
| Chat `P3` (executor) | EXECUTANDO · particulas no runtime Python | `EXECUTANDO · particulas no runtime Python` (ref `1a0b5d`, conferido no `ListAgents` de 18/09, 13:45; antes do título era `Executar D12/P3: partículas no runtime Python`) | `runtime-python/` e nada mais |

Degrau 12, rodada R2: o módulo lateral **P** (partículas) no runtime Python,
1ª fase, **escrito só pela spec** `formato/extensions/BONE_particles.md`.
**Não lê `runtime/src/`** — é esse isolamento que prova que a spec basta.
Três lotes: o acaso e o nascimento · a posição, a forma e a vida ·
o desenho e a ordem (mais o `measure: "particles"` do dump e os oito casos).
**Não toca** `runtime/`, `editor/`, `formato/`, `site/`, `ferramentas/`,
`conformidade/casos-pendentes/` (os casos são contrato), `documentos/manual/`.
Não move caso de `casos-pendentes/` para `casos/` — quem move é o Planejador.
Reporta ao `PLANEJADOR · dd3937`.

O irmão desta rodada é o `Executar D12/P2: partículas no runtime TypeScript`
(ref `8aec8b`), que implementa a mesmíssima spec sem olhar para este chat.

## 18/09/2026, 13:50 — Chat `P2` assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Chat `P2` (executor) | EXECUTANDO · particulas no runtime TS | `EXECUTANDO · particulas no runtime TS` (ref `8aec8b`, conferido no `ListAgents` de 18/09, 13:45; antes do título era `Executar D12/P2: partículas no runtime TypeScript` — se um falhar, tente o outro) | degrau 12, R2, parte `P2`: o módulo lateral **P (Partículas)** no runtime TypeScript — o hash PCG, o nascimento, a conta fechada da posição, o teto de vivas e o espaço — mais a medida nova `measure: "particles"` do `pose-dump`. Só `runtime/`, `runtime/testes/`, `ferramentas/src/conformidade/`. **Não toca** `runtime-python/` (nem para olhar), `editor/`, `formato/`, `site/`, `conformidade/casos-pendentes/`, `documentos/manual/`. Reporta ao `PLANEJADOR · dd3937` |

O irmão desta rodada é o `Executar D12/P3: partículas no runtime Python`
(ref `1a0b5d`), que implementa a mesmíssima spec **sem olhar para este chat**.
É isso que prova que a spec basta: foi assim que nasceram o C-299 e o C-300.

Não move caso de `casos-pendentes/` para `casos/` — quem move é o Planejador,
e só quando os dois runtimes passarem e o `npm run conformidade:dois` confrontar
campo a campo sem diferença.

## 18/09/2026, tarde — a parte `P3` (partículas no runtime Python) fechou

Versões **v17.7**, **v17.8** e **v18.2**. Escrito **só pela spec da extensão**,
sem abrir `runtime/src/` nem os Desvios do `P2`.

**Conferido pelo Planejador, rodando as provas ele mesmo:**

| Prova | Resultado |
|:---|:---|
| `python runtime-python/conformidade.py --casos conformidade/casos-pendentes` | **8 de 8**, "nenhuma" diferença nos oito |
| `python -m unittest discover runtime-python/testes` | **230** testes, OK (eram 145) |

**Os Desvios dele estão em `documentos/planos/DESVIOS P3 - runtime Python 2026-09-18.md`** —
seis frases que a spec não fecha, com leitura, motivo e teste de cada uma. **O
`P2` não as lê, e o Planejador não as repassa.** O confronto abre quando o `P2`
fechar.

### Três coisas desta parte que ficam como método

| O quê | Por quê |
|:---|:---|
| **A régua está medida, não prometida.** O teste não afirma que a conta é fechada: integra por passos a 30 e a 60 quadros por segundo, mostra que os dois dão pontos diferentes, que nenhum é o certo, e que a conta da spec dá um número só por qualquer caminho | A diferença entre dizer "funciona" e mostrar por quê |
| **Um teste dele estava errado, e o próprio teste pegou.** Ele afirmava que somar por passos daria diferente de fazer a conta de uma vez; era falso (a conta fechada compõe consigo mesma, e é por isso que o P-008 pode exigir o quadro igual bit a bit). **Reescrito para medir as duas coisas separadas**, não ajustado até ficar verde | O oposto exato do defeito que este projeto mais teme |
| **A armadilha do `angle`.** O comparador do pose-dump mede ângulo por distância circular. Se o campo `angle` caísse nela, um leitor que reduz para −180..180 **passaria** — e o leiame do P-001 diz que ele tem de falhar (251,145834 e −108,854166 são 360 de diferença). Todo campo sob `/particles/` usa a tolerância reta, com teste provando a armadilha e o motivo escrito | Prova frouxa é a cara da regra 21 que engana **a nós**. Os dois runtimes chegaram nisso por conta própria, sem se falarem |

Também corrigiu o `runtime-python/README.md`, que estava com números velhos
(dizia 53 casos, 145 testes, e "Extensões `BONE_*`: Nenhuma"). **O chat parou.**

## 18/09/2026, noite — `P2` e `P3` (partículas nos dois runtimes) fecharam

| Parte | Versões | Números |
|:---|:---|:---|
| `P2` TypeScript | v17.9, v18.1, v18.3, v18.7 | 8 de 8 casos · 71/71 · `tsc` limpo · 67 testes novos |
| `P3` Python | v17.7, v17.8, v18.2, v18.6 | 8 de 8 casos · 71/71 · 240 testes (eram 145) |

**O confronto está em `documentos/planos/CONFRONTO dos dois runtimes - particulas 2026-09-18.md`.**
Cinco leituras bateram; **três discordaram**, e nenhuma delas era exercitada por
caso nenhum — os dois passavam os oito e desenhariam diferente na mão de quem
usasse. As três viraram linha de spec.

### Duas causas de teste intermitente nesta casa, e a segunda era desconhecida

| Causa | Como se vê | O que fazer |
|:---|:---|:---|
| **Tempo**: o caso `--adaptador` abre 71 subprocessos e estourava o limite sob carga | vermelho na suíte inteira, verde sozinho | consertado pelo **tempo** (180 s → 600 s), nunca pelo escopo. Nem pulado, nem encurtado |
| **Duas janelas ao mesmo tempo**: a suíte lê um arquivo que outro chat está **gravando** | cai uma vez, passa no minuto seguinte | **não há o que consertar em código.** Número de fecho se mede com a **casa vazia** |

**A segunda vale como régua nova:** a porta fixa do roteiro e da medição não era
a única parte da casa com esse problema. Qualquer número medido com vários chats
trabalhando pode estar errado **para os dois lados** — acusar vermelho que não
existe, e esconder vermelho que existe.

### O jeito certo de relatar um vermelho

Do `P2`, e fica como modelo: **nomeie cada vermelho, diga de quem é, e prove.**
Ele conferiu a **data dos arquivos** para mostrar que quatro dos cinco eram de
outro chat em voo (`actions-table.ts` e `prefs.ts` com três minutos de vida), e
disse qual deve ser o número limpo depois — *"conferi o relógio, não o palpite"*.
Assim, se amanhã o número for outro, alguém percebe.

## 18/09/2026, fim da tarde — o chat `C` fechou a ficha dele

| Papel | Janela | Endereço | Estado |
|:---|:---|:---|:---|
| Chat `C` (executor) | EXECUTANDO · as portas do formato | `EXECUTANDO · as portas do formato [d296af]` | **fechou e parou. Pode ser arquivado** |

As cinco versões: **v18.0** sliders (porta D3) · **v18.5** áudio de eventos (D5) ·
**v18.9** física (D6) · **v19.3** variáveis e etiquetas (G9/P15) · **v19.6** a
barra das Regras apertada, depois da medição do fecho.

Quem pegar estas partes depois leia os **Desvios** do
`documentos/planos/ENCARGOS degrau 12 - o glace 2026-09-18.md`: há uma tabela
por lote, com o que Spriter, Spine e DragonBones fazem em cada gesto, e com o
que ficou de fora **escrito pelo nome** — tocar som durante a reprodução e a
onda na faixa (são do `dopesheet*`), a chave `reset` da §9.8 (é da Linha do
tempo), "assar todas de uma vez" (pede a `ui/dialog.ts`), e a observação de que
doze botões numa tira só cabem mas não se leem de relance.

**Uma decisão de palavra está aberta com o Humberto:** o `tag` da §8.5 virou
**"Etiqueta"** na tela, porque *"Marca"* já era o marcador da linha do tempo
(menu Animação → Marcas, tecla `M`, id `nova-marca`). Se ele preferir outra
palavra, é troca de strings.


## 18/09/2026 — o Chat `P1` fechou a parte dele (v17.1 a v20.6)

`EXECUTANDO · particulas no formato` (ref `022bc5`) terminou e **está ocioso**.
Entregou a extensão `BONE_particles` inteira: spec, JSON Schema, exemplo, o
registro com a convenção de nome de arquivo, os cinco códigos de partícula no
validador, o `rig` conferido (§4.8), e os **dezessete** casos P-001 a P-017.

| O que fica de pé para quem vier | Onde |
|:---|:---|
| A spec da extensão, com as **dez** frases caladas já escritas | `formato/extensions/BONE_particles.md` |
| O que cada caso prova e **o que aconteceria sem a decisão** | o leiame de cada `P-*` |
| **`P: 16/16`, e não 17** — o P-002 passa sem exercitar nada e está em `casos-pendentes/` | a §14 da spec, e o leiame dele |
| A prova de tudo isso | `ferramentas/testes/particulas.test.ts` (220) e `rig-no-validador.test.ts` (32) |

**Duas coisas que o próximo precisa saber, e que não estão no código:**

**1. Um caso se conserta editando o caso.** Os geradores viveram no scratchpad
desta janela e somem com ela. Isso é o estado certo, não uma perda: um gerador
vivo convida a regerar, e regerar apaga as linhas postas à mão nos arquivos.

**2. O número esperado vem da conta, nunca do gerador.** Dois casos nasceram
errados (P-009 com 5 em vez de 25, P-016 com 15 em vez de 10) e foram pegos
porque a conta tinha sido feita **à mão antes** de gerar. Pelo caminho natural —
escrever o leiame a partir do número que saiu — os dois teriam passado, e seriam
dois casos errados servindo de referência a três implementações.

**A régua que a rodada deixou**, e ela custou três erros de três donos
diferentes: **escrever não é ler, e ler não é conferir.** Nos três a informação
estava escrita e ao alcance; ninguém a leu **antes** de agir.

## 18/09/2026, noite — O DEGRAU 12 FECHOU (v20.7)

Fecho pelo `PLANEJADOR · dd3937`, com os cinco chats parados e a casa vazia.
**Todos os números medidos pelo Planejador, não somados dos relatórios.**

| Prova | Resultado |
|:---|:---|
| `npx vitest run` | **3.801** · 3.771 verdes · 29 pulados · **1 vermelho** (o do manual, 15/09, degrau 13) |
| `tsc` | limpo |
| Conformidade, nos **dois** runtimes | **87 de 87**, `P: 16/16` |
| `npm run roteiro` | **14 de 14** |
| `npm run medir` | 28 de 28 de lado, 19 de 28 de altura |
| `programa/` | montado, 61 arquivos |

| Chat | Parte | Estado |
|:---|:---|:---|
| `EXECUTANDO · biblioteca de animacoes` | v17.0, v17.3 | fechado, **arquivável** |
| `EXECUTANDO · particulas no formato` | v17.1, v17.2, v17.4–v17.6, v18.4, v18.8, v19.2, v19.5, v19.7, v19.8, v20.1, v20.4, v20.6 | fechado, **arquivável** |
| `EXECUTANDO · as portas do formato` | v18.0, v18.5, v18.9, v19.3, v19.6 | fechado, **arquivável** |
| `EXECUTANDO · particulas no runtime TS` | v17.9, v18.1, v18.3, v18.7, v19.1, v19.4, v20.3, v20.5 | fechado, **arquivável** |
| `EXECUTANDO · particulas no runtime Python` | v17.7, v17.8, v18.2, v18.6, v19.0, v19.9, v20.0, v20.2 | fechado, **arquivável** |
| `PLANEJADOR · dd3937` | encargo, confronto, as réguas, os fechos | **de pé** |

**O que falta do `ARQUITETO 4`:** os itens 4 a 6 do D12 (grade em perspectiva,
trajeto do movimento, flash e pulso, tremor com semente, curvas, os pequenos) —
e o **D13, o manual**, que **não abre sem o Humberto pedir**.

**Duas perguntas abertas com ele**, escritas para não se perderem:

| # | O quê |
|:---:|:---|
| 1 | As teclas de painel (linha do tempo, Ordem, Árvore) entram na janela Ajuda → Atalhos? Pô-las lá dobra a lista |
| 2 | A palavra **"Etiqueta"** para o `tag` da §8.5 — "Marca" já era o marcador da linha do tempo. Se ele preferir outra, é troca de strings |

**Uma observação de desenho, não pedido:** a barra da aba Regras tem **doze
botões** numa tira só. Cabe (medido), mas doze não se lê de relance; a Árvore
resolveu caso parecido agrupando num `Novo ▾`. Está nos Desvios do encargo.

## 18/09/2026, 17:00 — PESQUISA · o que o código tem e o menu não assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Pesquisa | PESQUISA · o que o código tem e o menu não | `PESQUISA · o que o código tem e o menu não` (ref `b78f3a`, conferido no `ListAgents` de 18/09, 16:59; antes do título era `Programação vs menu real`) | confere se o que o código tem está ao alcance de um menu. Só lê `editor/src`. Escreveu `documentos/pesquisa/O QUE O CODIGO TEM E O MENU NAO 2026-09-18.md` e o medidor `ferramentas/provas/codigo-sem-porta.mjs`. O Humberto fala direto nesta janela |

## 18/09/2026, 19:55 — EXECUTANDO · manual simples das funções assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor (só documento) | EXECUTANDO · manual simples das funções | `EXECUTANDO · manual simples das funções` (ref `b2fa48`, conferido no `ListAgents` de 18/09, 19:54; antes do título era `Manual de funcionalidades do programa` — se um falhar, tente o outro) | pedido direto do Humberto nesta janela: um manual **simples** — o que o programa tem e como se faz cada coisa — tirado do código (`ui/menus.ts`, `ui/keys.ts`, os painéis), não dos manuais velhos. Escreve **um arquivo só**: `documentos/MANUAL SIMPLES 2026-09-18.md`. Só lê `editor/src`. **Não toca** `documentos/manual/`, código, roteiro nem medição |

## 21/09/2026, 23:50 — EXECUTANDO · os quatro defeitos do uso assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · os quatro defeitos do uso | `EXECUTANDO · os quatro defeitos do uso` (ref `912e3b`, conferido no `ListAgents` de 21/09, 23:48) | os quatro defeitos achados **usando** o programa (`documentos/planos/DEFEITOS achados no uso 2026-09-19.md`). Quatro lotes, um por defeito: **1º a pele** (arrastar para Ativas põe no topo), 2º desfazer perde o osso + o teste de propriedade da pilha, 3º "Regra…"/"Pele" fecham a aba, 4º a curva no `Ctrl+K`. **Par de fotos por lote** em `backup/fotos-defeitos/`. Cerca: `viewport/tools/create-bone.ts`, `doc/drop-entity.ts`, `panels/rules.ts`, `panels/skins*.ts`, `anim/keying.ts`. Reporta ao `PLANEJADOR · dd3937` |

## 21/09/2026, 23:52 — EXECUTANDO · o vigia do comando sem porta assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · o vigia do comando sem porta | `EXECUTANDO · o vigia do comando sem porta` (ref `23aa5e`, conferido no `ListAgents` de 21/09, 23:48; antes do título era `O vigia do comando sem porta, e a paleta visível`) | as partes 1 e 3 do plano `COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`. **Lote 1:** o vigia que parte do COMANDO — todo `Command` tem porta ou linha de exceção com o motivo escrito; entrega visível é a lista que o Humberto lê. **Lote 2:** a paleta de comandos deixa de ser segredo (dica no menu, a janela de Atalhos apontando para ela); par de fotos em `backup/fotos-paleta/`. Cerca: `ui/action-audit.ts`, `ui/palette.ts`, `ui/menus.ts`, `ui/actions-table.ts` e os testes `acoes`, `menus`, `teclas`. **Não toca** `panels/rules.ts`, `panels/skins*.ts`, `viewport/tools/create-bone.ts`, `doc/drop-entity.ts`, `anim/keying.ts` (são do chat `912e3b`), nem `runtime/`, `runtime-python/`, `formato/`, `site/`, `documentos/manual/`. Reporta ao `PLANEJADOR · dd3937` |

`ListAgents` de 21/09, 23:48: vivos neste projeto `PLANEJADOR · dd3937` (ref `ffbe83`, ocioso) e `EXECUTANDO · os quatro defeitos do uso` (ref `912e3b`, ocupado).

## 22/09/2026, 00:44 — EXECUTANDO · as particulas na tela assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · as particulas na tela | `EXECUTANDO · as particulas na tela` (ref `d56f6c`, conferido no `ListAgents` de 22/09, 00:43; antes do título era `As partículas na tela (o volante)`) | o encargo `documentos/planos/ENCARGO as particulas na tela 2026-09-22.md` — **o volante**: o motor das partículas está pronto nos dois runtimes e no editor não há um botão para criar um emissor. Três lotes: **1** o emissor existe e se vê (Novo ▾ da Árvore, `POR_TIPO` do `thumbnail-kind.ts`, ficha mínima), **2** as partículas aparecem na cena e a agulha para trás mostra o MESMO quadro, **3** a ficha da 1ª fase. **Par de fotos por lote** em `backup/fotos-particulas/`. Cerca: `panels/tree-commands.ts`, `panels/thumbnail-kind.ts`, `panels/properties-model.ts` e `properties.ts`, `viewport/viewport-draw.ts`, `viewport/picking.ts` e os testes das partes. **Não toca** `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`, `ui/action-audit.ts`, `ui/command-audit.ts`. Reporta ao `PLANEJADOR · dd3937` |

`ListAgents` de 22/09, 00:43: vivos neste projeto `PLANEJADOR · dd3937` (ref `ffbe83`, ocupado), `EXECUTANDO · o vigia do comando sem porta` (ref `23aa5e`, ocioso) e `EXECUTANDO · os quatro defeitos do uso` (ref `912e3b`, ocioso).

## 22/09/2026, 00:52 — EXECUTANDO · a folha por tarefa assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor (só documento e ferramenta) | EXECUTANDO · a folha por tarefa | `EXECUTANDO · a folha por tarefa` (ref `237290`, conferido no `ListAgents` de 22/09, 00:45; antes do título era `A folha: o que o programa faz, por tarefa`) | a **parte 2** do plano `COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`: a folha **por tarefa**, não por menu — *"para fazer isto · clique aqui · provado"*. Régua única em `ferramentas/provas/tarefas.ts`, lida pelo relatório (`npm run tarefas`) e pelo teste (`ferramentas/testes/tarefas.test.ts`). A folha sai em `documentos/O QUE O PROGRAMA FAZ 2026-09-22.md`. Cerca: `ferramentas/provas/`, `ferramentas/testes/`, `documentos/`, `package.json` (só acrescentando). **NÃO TOCA `editor/src`** — nem uma linha: há três chats lá. Reporta ao `PLANEJADOR · dd3937` |

`ListAgents` de 22/09, 00:45: vivos neste projeto `PLANEJADOR · dd3937` (ref `ffbe83`), `EXECUTANDO · o vigia do comando sem porta` (ref `23aa5e`), `EXECUTANDO · os quatro defeitos do uso` (ref `912e3b`), `EXECUTANDO · as particulas na tela` (ref `d56f6c`) e `EXECUTANDO · flash, pulso e tremor` (ref `66d80d`).

## 22/09/2026, 00:44 — EXECUTANDO · flash, pulso e tremor assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · flash, pulso e tremor | `EXECUTANDO · flash, pulso e tremor` (ref `66d80d`, conferido no `ListAgents` de 22/09, 00:44; antes do título era `Flash, pulso e tremor: efeito sem partícula`) | os itens 2 e 4 da §6 de `COMO SE FAZ EFEITO 2026-09-16.md`: três efeitos que **gravam chaves comuns e somem** — nenhum campo novo no formato, nenhum runtime novo. Conta em `editor/src/anim/efeitos.ts`; portas em `editor/src/ui/efeitos-actions.ts`; teste em `editor/testes/efeitos.test.ts`; fotos em `backup/fotos-efeitos/`. Cerca: `editor/src/anim/` e os de passagem `ui/actions-table.ts`, `ui/menus.ts`, `ui/keys.ts`, `contract.ts`, `CHANGELOG.md`, `ESTADO.md`, `backup/INDICE.md`. **Não toca** `editor/src/viewport/`, `panels/properties*`, `panels/tree-commands.ts`, `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`, `ui/action-audit.ts`, `ui/command-audit.ts`. **Não escreve em `anim/keying.ts`**, que é do chat `912e3b`: só importa. Reporta ao `PLANEJADOR · dd3937` |

**Lote 1 fechado na v21.8, 01:02.** `efeitos.test.ts` 30 verdes às 00:57; os
nove arquivos de teste que a mudança podia atingir — `efeitos`, `acoes`,
`menus`, `teclas`, `fronteiras`, `chaves`, `linha-do-tempo`, `varios`,
`ligacao` — **465 verdes, nenhum vermelho, às 01:01**. `tsc` limpo às 00:59.
**Número de suíte inteira não foi medido de propósito**: há quatro chats
gravando, e a régua 24 pede casa vazia. Desvios e a comparação com Spriter,
Spine e DragonBones em `documentos/planos/EFEITOS flash pulso e tremor 2026-09-22.md`.

**Lote 2 fechado na v22.5, 01:17 — a folha animada do Aseprite entra
arrastando.** `folha-animada.test.ts` 26 verdes; os nove arquivos que a mudança
podia atingir — `folha-animada`, `efeitos`, `pasta-do-projeto`, `fronteiras`,
`arquivo`, `acoes`, `menus`, `grade-de-imagens`, `exportar-e-importar` —
**525 verdes, 2 pulados, nenhum vermelho, às 01:17**; `tsc` limpo às 01:17.
Fotos em `backup/fotos-efeitos/lote-2_*`, e a de "antes" chama o caminho velho
de verdade. **A metade da pasta numerada já existia desde o degrau 8 e não foi
reescrita.** Continua aberto: as `frameTags` do Aseprite são lidas e ainda não
viram animação.

## 28/09/2026, 23:25 — EXECUTANDO · finalizar o programa assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · finalizar o programa | `EXECUTANDO · finalizar o programa` (ref `232779`, conferido no `ListAgents` de 28/09, 23:23; antes do título era `Finalizar programa` — se um falhar, tente o outro) | pedido direto do Humberto nesta janela: *"você consegue finalizar esse programa?"*. Plano em `documentos/planos/PLANO finalizar o programa 2026-09-28.md`, sete lotes. **O lote 1 não depende de decisão e começa já**; os outros esperam a palavra dele. Sozinho em `editor/src`. **Não toca** `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/` |

`ListAgents` de 28/09, 23:23: vivo neste computador, além desta janela, só
`Auditoria do programa` (ref `572cc0`, ocioso, aberto às 23:16, **sem linha nesta
tabela**). Todos os chats de 18 a 22/09 estão **desligados**. Não há Planejador
nem Diretor de pé: o Humberto fala direto nesta janela.

**Linha de base medida às 23:24, casa vazia:** `tsc` limpo · suíte 4.182
(4.152 verdes, 29 pulados, 1 vermelho do manual) **mais 4 erros soltos** em
`acoes.test.ts`, que ninguém tinha escrito · conformidade 87 de 87.

## 28/09/2026, 23:42 — PLANEJADOR · 9f75b5 assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Planejador** | PLANEJADOR · 9f75b5 | `PLANEJADOR · 9f75b5` (ref `9f75b5`, conferido no `ListAgents` de 28/09, 23:37; antes do título era `Gerenciador de projeto com chats` — se um falhar, tente o outro) | ordem direta do Humberto nesta janela: gerenciar o projeto, abrir os chats e finalizar o programa. Escreveu `documentos/planos/ENCARGOS rodada final 2026-09-28.md`. Recebe os relatórios, dá o **PODE** das portas fixas e da suíte inteira. **Não escreve código.** O Humberto fala direto nesta janela |

### A rodada final — cinco chats, cercas que não se cruzam

| Chat | Janela | Endereço | Parte |
|:---:|:---|:---|:---|
| A | EXECUTANDO · finalizar o programa | `EXECUTANDO · finalizar o programa` (ref `232779`) | os defeitos e a caça de erro pelo uso. **Passa a reportar ao Planejador** |
| B | EXECUTANDO · partículas que se acham | (assina ao abrir) | as partículas: a porta, os modelos prontos, a ficha que cabe |
| C | EXECUTANDO · as portas das regras | (assina ao abrir) | a aba Regras: as quatro funções sem porta, e o `Novo ▾` |
| D | EXECUTANDO · árvore, malha e linha do tempo | (assina ao abrir) | Evento e Parâmetro na Árvore, a chave de virada, o caminho, a malha que cabe |
| E | EXECUTANDO · arquivo e importar | (assina ao abrir) | importar como passo de desfazer, etiquetas do Aseprite |

Caminho: `A / B / C / D / E → PLANEJADOR · 9f75b5 → Humberto`. Todos em Opus.
**Régua nova desta rodada:** referência na internet antes de cada lote, escrita em
`documentos/pesquisa/nova pesquisa/`. Cada chat vê o programa **na porta da sua ficha** (5201 a 5205).

## 28/09/2026, 23:44 — EXECUTANDO · as portas das regras assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor (chat C) | EXECUTANDO · as portas das regras | `EXECUTANDO · as portas das regras` (ref `bd5aa5`, conferido no `ListAgents` de 28/09, 23:43; antes do título era `Executar C: as portas das regras` — se um falhar, tente o outro) | a Ficha C de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: as quatro funções sem porta da aba Regras (`DeleteTag`, `RenameTag`, `SetRuleChain`, `KeyDriverTarget`) e o `Novo ▾` da tira. Referência antes de cada lote em `documentos/pesquisa/nova pesquisa/REFERENCIA regras 2026-09-28.md`. Cerca: `editor/src/panels/rules.ts`, `rules-actions.ts`, `rules-model.ts`, `rules-vars.ts`, `rules-physics.ts`, `rules.css` e `editor/testes/regras.test.ts`; de passagem, só acrescentando. Vê o programa na porta **5202**. Fotos em `backup/fotos-rodada-final/regras/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:44 — EXECUTANDO · partículas que se acham assinou (chat B)

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · partículas que se acham | `EXECUTANDO · partículas que se acham` (ref `8dd181`, conferido no `ListAgents` de 28/09, 23:43; antes do título era `Executar B: partículas que se acham` — se um falhar, tente o outro) | a **Ficha B** de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: a porta do emissor que **se acha** (botão em ícone à vista, e modelos prontos de fogo, fumaça, faísca e poeira), a ficha que cabe (grupos dobráveis), e os campos que só existem no arquivo (`bursts`, as coordenadas de `shape: edge`). Referência antes de cada lote em `documentos/pesquisa/nova pesquisa/REFERENCIA particulas 2026-09-28.md`. Cerca: `panels/properties.ts`, `properties-model.ts`, `properties.css`, `viewport/particles-view.ts`, `viewport/viewport-toolbar.ts`, `panels/thumbnail-kind.ts`, um arquivo novo para os modelos, os testes `paineis` e `cena`. **Não toca** `panels/tree*`, `panels/rules*`, `io/*`, `ui/shell*.ts`, `doc/*`, `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`. Vê o programa na porta **5201**. Fotos em `backup/fotos-rodada-final/particulas/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:45 — EXECUTANDO · arquivo e importar assinou (chat E)

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor (chat E) | EXECUTANDO · arquivo e importar | `EXECUTANDO · arquivo e importar` (ref `1d68ed`, conferido no `ListAgents` de 28/09, 23:44; antes do título era `Executar E: arquivo e importar` — se um falhar, tente o outro) | a **Ficha E** de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: importar imagens vira UM passo de desfazer (`ImportImagesCommand`), as `frameTags` do Aseprite viram animação (D3), e o uso de cada item de importar e exportar do menu Arquivo. Referência antes de cada lote em `documentos/pesquisa/nova pesquisa/REFERENCIA arquivo e importar 2026-09-28.md`. Cerca: `editor/src/io/*`, `editor/src/ui/shell-drop.ts`, os testes `arquivo`, `pasta-do-projeto`, `folha-animada`, `exportar-e-importar`. **Não toca** `ui/shell.ts`, `ui/shell-file.ts`, `doc/*`. Vê o programa na porta **5204**. Fotos em `backup/fotos-rodada-final/arquivo/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:44 — EXECUTANDO · árvore, malha e linha do tempo assinou (chat D)

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor | EXECUTANDO · árvore, malha e linha do tempo | `EXECUTANDO · árvore, malha e linha do tempo` (ref `3f113a`, conferido no `ListAgents` de 28/09, 23:44; antes do título era `Executar D: árvore, malha e linha do tempo` — se um falhar, tente o outro) | a **Ficha D** de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`, quatro lotes: Evento e Parâmetro ganham linha na Árvore · tirar a chave de virada de corpo (`removeBodyKey`, hoje sem porta) · o caminho ganha e perde ponto pela cena · a aba Malha e pesos cabe, rolando, com grupos dobráveis. Referência antes de cada lote em `documentos/pesquisa/nova pesquisa/REFERENCIA arvore malha e linha do tempo 2026-09-28.md`. Cerca: `panels/tree*`, `panels/mesh-panel*`, `mesh/*`, `viewport/tools/mesh-tool.ts`, `panels/dopesheet*`, `anim/body.ts`, os testes `arvore`, `malha`, `linha-do-tempo`, `chaves`; de passagem, só acrescentando. **Não toca** `panels/properties*`, `viewport/viewport-toolbar.ts`, `viewport/particles-view.ts`, `panels/rules*`, `io/*`, `ui/shell*.ts`, `doc/*`, `viewport/tools/shear.ts`, `panels/draw-order*`, `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`. **Não escreve em `anim/keying.ts`**: só importa. Vê o programa na porta **5203**. Fotos em `backup/fotos-rodada-final/arvore-malha-tempo/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:55 — a segunda leva: dez chats a mais (F a O)

Ordem do Humberto ao `PLANEJADOR · 9f75b5`: *"uma coisa não segue a outra"*. **O alvo é a SEQUÊNCIA de cada tarefa** — a panela, o arroz e a ordem, à vista. Fichas no fim de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`.

| Chat | Janela | Uma coisa só | Porta |
|:---:|:---|:---|:---:|
| F | EXECUTANDO · cena e ferramentas | a sequência de mexer no boneco na cena | 5206 |
| G | EXECUTANDO · animações, prévia e curvas | criar, tocar e ajustar uma animação | 5207 |
| H | EXECUTANDO · imagens e pivô | trazer a arte e marcar o pivô | 5208 |
| I | EXECUTANDO · exibição, peles e histórico | ver, esconder e vestir | 5209 |
| J | USO · do zero ao boneco montado | usa o programa de ponta a ponta. **Não escreve código** | 5210 |
| K | USO · animar um ciclo de andar | **não escreve código** | 5211 |
| L | USO · malha e pesos | **não escreve código** | 5212 |
| M | USO · peles e troca de roupa | **não escreve código** | 5213 |
| N | USO · exportar e entregar | **não escreve código** | 5214 |
| O | PESQUISA · onde fica cada botão | compara a ordem dos menus. **Não escreve código** | — |

Cada um assina a própria linha ao abrir. Todos reportam ao `PLANEJADOR · 9f75b5`.

## 28/09/2026, 23:52 — EXECUTANDO · cena e ferramentas assinou (chat F)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat F) | EXECUTANDO · cena e ferramentas | `EXECUTANDO · cena e ferramentas` (ref `d1f2f2`, conferido no `ListAgents` de 28/09, 23:52; antes do título era `Executar F: cena e ferramentas` — se um falhar, tente o outro) | a **Ficha F** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: a SEQUÊNCIA de mexer no boneco na cena — escolher, mover, girar, escalar, criar osso, ponto e caixa, posar. Quatro lotes: a referência (Spriter primeiro, Spine depois) em `documentos/pesquisa/nova pesquisa/SEQUENCIA cena e ferramentas 2026-09-28.md` · a mesma fila no nosso programa, com foto · o conserto onde a fila quebra · os defeitos que os chats de uso acharem. Cerca: `editor/src/viewport/*` e os testes `viewport`, `cena-selecao`, `ferramentas`, **menos** `tools/shear.ts`, `tools/compensate.ts`, `tools/mesh-tool.ts`, `particles-view.ts`, `viewport-toolbar.ts`, `onion.ts`; de passagem, só acrescentando. **Não toca** `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`. Vê o programa na porta **5206**. Fotos em `backup/fotos-rodada-final/cena/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:53 — EXECUTANDO · animações, prévia e curvas assinou (chat G)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat G) | EXECUTANDO · animações, prévia e curvas | `EXECUTANDO · animações, prévia e curvas` (ref `7f500f`, conferido no `ListAgents` de 28/09, 23:52; antes do título era `Executar G: animações, prévia e curvas` — se um falhar, tente o outro) | a **Ficha G** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: a SEQUÊNCIA de criar, tocar e ajustar uma animação — nova animação, abrir, tocar, a Prévia, as curvas da chave. Quatro lotes: a referência (Spriter primeiro, Spine depois) em `documentos/pesquisa/nova pesquisa/SEQUENCIA animacoes previa e curvas 2026-09-28.md` · a mesma fila no nosso programa, com foto · o conserto onde a fila quebra · os defeitos que os chats de uso acharem. Cerca: `editor/src/panels/animations*`, `panels/preview*`, `panels/graph*`, `anim/animations.ts`, `anim/curves.ts`, `anim/transport.ts` e os testes `animando`, `previa`, `curvas`, `tocador`; de passagem, só acrescentando. **Não toca** `panels/dopesheet*`, `anim/body.ts` (chat D), `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`. **Não escreve em `anim/keying.ts`**: só importa. Vê o programa na porta **5207**. Fotos em `backup/fotos-rodada-final/animacoes/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:53 — EXECUTANDO · imagens e pivô assinou (chat H)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat H) | EXECUTANDO · imagens e pivô | `EXECUTANDO · imagens e pivô` (ref `ad08e1`, conferido no `ListAgents` de 28/09/2026, 23:53; antes do título era `Executar H: imagens e pivô` — se um falhar, tente o outro) | a **Ficha H** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: a SEQUÊNCIA de trazer a arte e marcar o pivô — abrir a pasta, ver as imagens, arrastar para a cena, definir o pivô, trocar a imagem de um desenho. Quatro lotes: a referência (Spriter primeiro, Spine depois) em `documentos/pesquisa/nova pesquisa/SEQUENCIA imagens e pivo 2026-09-28.md` · a mesma fila no nosso programa, com foto, e o painel Pivôs · o conserto onde a fila quebra · os defeitos que os chats de uso acharem. Cerca: `editor/src/panels/palette*`, `panels/image-picker*`, `panels/image-grid-model.ts`, `panels/pivot-dialog.ts`, `panels/pivot-panel*`, `panels/thumbnails.ts`, os testes `pivo` e `grade-de-imagens`; de passagem, só acrescentando. **Não toca** `io/*` (só importa), `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`. Vê o programa na porta **5208**. Fotos em `backup/fotos-rodada-final/imagens-e-pivo/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:53 — EXECUTANDO · exibição, peles e histórico assinou (chat I)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat I) | EXECUTANDO · exibição, peles e histórico | `EXECUTANDO · exibição, peles e histórico` (ref `81e1ea`, conferido no `ListAgents` de 28/09/2026, 23:53; antes do título era `Executar I: exibição, peles e histórico` — se um falhar, tente o outro) | a **Ficha I** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: a SEQUÊNCIA de ver, esconder e vestir — esconder e travar peças, o papel de cebola, fazer e vestir uma pele, voltar passos pelo Histórico. Quatro lotes: a referência (Spriter primeiro, Spine depois) em `documentos/pesquisa/nova pesquisa/SEQUENCIA exibicao peles e historico <data do relógio>.md` · a mesma fila no nosso programa, com foto · o conserto onde a fila quebra · os defeitos que os chats de uso acharem. Cerca: `editor/src/panels/view-panel*`, `panels/skins*`, `panels/history*`, `editor/src/viewport/onion.ts` e os testes `exibicao`, `peles`; de passagem, só acrescentando. **Não toca** `panels/properties*` (chat B), o resto de `viewport/` (chat F), `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`. Vê o programa na porta **5209**. Fotos em `backup/fotos-rodada-final/exibicao-e-peles/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:54 — USO · do zero ao boneco montado assinou (chat J)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Uso (chat J) | USO · do zero ao boneco montado | `USO · do zero ao boneco montado` (ref `28d601`, conferido no `ListAgents` de 28/09/2026, 23:53; antes do título era `Usar J: do zero ao boneco montado` — se um falhar, tente o outro) | a linha **J** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: **usa** o programa como uma pessoa, do zero ao boneco montado — abrir a pasta, pôr as imagens na cena, marcar o pivô, criar os ossos, ligar imagem ao osso, arrumar filho e pai, arrumar a ordem de desenho, salvar e reabrir. Três entregas: a referência (Spriter primeiro, Spine depois), a mesma fila no nosso programa com foto e as quatro perguntas, e os defeitos. Tudo em `documentos/pesquisa/nova pesquisa/SEQUENCIA do zero ao boneco montado 2026-09-28.md`; defeitos em `documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, só acrescentando. **Não escreve código. Não conserta nada.** Não roda suíte, roteiro nem medição. Vê o programa na porta **5210**. Fotos em `backup/fotos-rodada-final/uso-boneco/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:54 — USO · animar um ciclo de andar assinou (chat K)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Uso (chat K) | USO · animar um ciclo de andar | `USO · animar um ciclo de andar` (ref `b547b4`, conferido no `ListAgents` de 28/09/2026, 23:54; antes do título era `Usar K: animar um ciclo de andar` — se um falhar, tente o outro) | a **linha K** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: USA o programa como uma pessoa — criar a animação, posar, andar no tempo, copiar e colar pose espelhada, fechar o laço, tocar, ajustar o tempo das chaves, mudar a curva, trocar imagem no meio. Três entregas: a referência (Spriter e Spine, com link) e a mesma fila no nosso, em `documentos/pesquisa/nova pesquisa/SEQUENCIA animar um ciclo de andar <data do relógio>.md` · os defeitos em `documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, só acrescentando. **Não escreve código. Não conserta nada.** Não roda suíte, roteiro nem medição. Vê o programa na porta **5211**. Fotos em `backup/fotos-rodada-final/uso-animar/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:55 — USO · malha e pesos assinou (chat L)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Uso (chat L) | USO · malha e pesos | `USO · malha e pesos` (ref `6c52cf`, conferido no `ListAgents` de 28/09/2026, 23:54; antes do título era `Usar L: malha e pesos` — se um falhar, tente o outro) | a **linha L** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: USA o programa como uma pessoa, na tarefa malha e pesos — virar malha, contorno, vértice e aresta, ligar ossos, pesos automáticos, pincel de pesos, dobrar o osso, arrastar vértice na animação. Três entregas: a referência (Spine, DragonBones, Spriter, com link) e a mesma fila no nosso, com foto e as quatro perguntas, em `documentos/pesquisa/nova pesquisa/SEQUENCIA malha e pesos <data do relógio>.md` · os defeitos em `documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, só acrescentando. **Não escreve código. Não conserta nada.** Não roda a suíte, o roteiro nem a medição. Vê o programa na porta **5212**. Fotos em `backup/fotos-rodada-final/uso-malha/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:56 — USO · peles e troca de roupa assinou (chat M)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Uso (chat M) | USO · peles e troca de roupa | `USO · peles e troca de roupa` (ref `8f01e9`, conferido no `ListAgents` de 28/09/2026, 23:55; antes do título era `Usar M: peles e troca de roupa` — se um falhar, tente o outro) | a linha **M** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: **usa** o programa como uma pessoa, na tarefa peles e troca de roupa — fazer pele, pôr imagens nela, vestir e despir, pele de uma pasta, trocar a imagem pelo botão direito e no meio da animação, exportar e importar pele. Três entregas: a referência (Spriter primeiro, Spine depois), a mesma fila no nosso programa com foto e as quatro perguntas, e os defeitos. Tudo em `documentos/pesquisa/nova pesquisa/SEQUENCIA peles e troca de roupa 2026-09-28.md`; defeitos em `documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, só acrescentando. **Não escreve código. Não conserta nada.** Não roda suíte, roteiro nem medição. Vê o programa na porta **5213**. Fotos em `backup/fotos-rodada-final/uso-peles/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:55 — USO · exportar e entregar assinou (chat N)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Uso (chat N) | USO · exportar e entregar | `USO · exportar e entregar` (ref `3b0915`, conferido no `ListAgents` de 28/09/2026, 23:54; antes do título era `Usar N: exportar e entregar` — se um falhar, tente o outro) | a **linha N** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: USA o programa como uma pessoa, na tarefa exportar e entregar — com uma animação pronta: sequência de PNG, folha de sprites, GIF, vídeo, a área de recorte, repetir a última exportação, salvar como pacote, salvar como binário, entregar um corpo; e confere que o arquivo que saiu ABRE. Três entregas: a referência (Spriter e Spine, com link) e a mesma fila no nosso, com foto e as quatro perguntas, em `documentos/pesquisa/nova pesquisa/SEQUENCIA exportar e entregar 2026-09-28.md` · os defeitos em `documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, só acrescentando. **Não escreve código. Não conserta nada.** Não roda a suíte, o roteiro nem a medição. **Importar é do chat E**; este só exporta. Vê o programa na porta **5214**. Fotos em `backup/fotos-rodada-final/uso-exportar/`; o que o programa baixar, em `backup/fotos-rodada-final/uso-exportar/saidas/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 28/09/2026, 23:55 — PESQUISA · onde fica cada botão assinou (chat O)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Pesquisa (chat O) | PESQUISA · onde fica cada botão | `PESQUISA · onde fica cada botão` (ref `c39a0e`, conferido no `ListAgents` de 28/09/2026, 23:55; antes do título era `Pesquisar O: onde fica cada botão` — se um falhar, tente o outro) | o **chat O** da segunda leva de `documentos/planos/ENCARGOS rodada final 2026-09-28.md`: o mapa de onde fica cada botão no Spriter, no Spine, no DragonBones e no nosso. Três entregas: a referência dos três programas, com link · o mapa dos nossos 7 menus, painéis e barras · a comparação, com três listas (só em painel · em menu onde ninguém procura · a ordem), em `documentos/pesquisa/nova pesquisa/ONDE FICA CADA BOTAO 2026-09-28.md`. **Não escreve código.** Só lê `editor/`. Não roda suíte, roteiro nem medição. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 00:06 — EXECUTANDO · a casca assinou (chat A2)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat A2) | EXECUTANDO · a casca | `EXECUTANDO · a casca` (ref `3e65b2`, conferido no `ListAgents` de 29/09/2026, 06:03, depois do reinício da máquina às 05:58; a ref `5e8aa5` **morreu**; antes dela, conferida em 04:32; a ref `30df9e` de 00:05 **morreu**; antes do título era `Executar A2: a casca e os defeitos do chat A` — se um falhar, tente o outro) | **assume a parte do chat A** (`EXECUTANDO · finalizar o programa`, ref `232779`, arquivado em 29/09 às 00:02 com o lote 1 escrito e não fechado — **esse endereço morreu**). Quatro lotes: a referência da casca (menus, atalhos e janelas de aviso no Spriter e no Spine, com link) em `documentos/pesquisa/nova pesquisa/REFERENCIA a casca 2026-09-29.md` · os defeitos herdados A1, A2, A3, A5 e as duas fotos que faltaram · a casca pela régua do arroz (teclas de painel em Ajuda → Atalhos, a janela de descarte própria) · os defeitos de casca que os chats de uso acharem. Cerca: `editor/src/ui/shell*.ts` (**menos** `ui/shell-drop.ts`, do chat E), `ui/dialog.ts`, `ui/dialog.css`, `ui/keys-dialog.ts`, `editor/src/doc/*`, `viewport/tools/shear.ts`, `viewport/tools/compensate.ts`, `panels/draw-order*`, os testes `acoes`, `inclinar`, `documento`, `ordem`, `teclas`; de passagem, só acrescentando. **Não toca** `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`. Vê o programa na porta **5205**. Fotos em `backup/fotos-rodada-final/defeitos/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 04:48 — EXECUTANDO · a tela que cabe assinou (chat P)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat P) | EXECUTANDO · a tela que cabe | `EXECUTANDO · a tela que cabe` (ref `b143ea`, conferido no `ListAgents` de 29/09/2026, 04:47; antes do título era `Executar P: a tela que cabe` — se um falhar, tente o outro) | divide com o chat A2 (`EXECUTANDO · a casca`) a parte "Casca e menus": **ela** fica com menus, janelas, arquivo e documento; **este** fica com **tamanho e lugar na tela**. Cinco lotes: a referência (como Spriter e Spine dividem a tela e o que fazem na janela pequena, com link) em `documentos/pesquisa/nova pesquisa/REFERENCIA a tela que cabe 2026-09-29.md` · os que PULAM (rodapé de uma linha só: J4, F5, L14; a cena com altura mínima: K13) · os que NÃO CABEM (barra de ações com "Mais ▾": L16, I-O3; a lista de animações e a alça do divisor: K1b, M16) · o arranjo de fábrica (P33) · os defeitos de tamanho e lugar que a fila trouxer. Cerca: `editor/src/ui/shell.css`, `ui/layout-model.ts`, `ui/panel-groups.ts`, `ui/action-bar-model.ts`, `ui/toolbar-model.ts`, `ui/arrangements.ts`, `panels/panels.css` (só a parte comum), `panels/dock-model.ts`, os testes `colunas-e-barra` e `tema-e-ficha`; de passagem, só acrescentando. **Não toca** `ui/shell*.ts`, `ui/menus.ts`, `ui/dialog.*`, `doc/*` (da casca), o CSS de painel com dono, `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/`, `documentos/manual/`. Vê o programa na porta **5216**. Fotos em `backup/fotos-rodada-final/tela/`, nas duas medidas. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 06:03 — EXECUTANDO · as portas das regras assinou de novo (depois do reinício)

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor (chat C) e **fechador da casa** (P51) | EXECUTANDO · as portas das regras | `EXECUTANDO · as portas das regras` (ref **`565f89`**, conferido no `ListAgents` de 29/09, 06:03; o ref `bd5aa5` de 28/09 morreu no reinício das 05:58) | a Ficha C (aba Regras) e `ferramentas/provas/` (P44). Mede e fecha a casa nas janelas de fecho. Reporta ao `PLANEJADOR · 9f75b5` (ref `367d95` hoje) |

## 29/09/2026, 06:04 — chat I assina de novo, depois do reinício das 05:58

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat I) | EXECUTANDO · exibição, peles e histórico | `EXECUTANDO · exibição, peles e histórico` (ref `3ac78d`, conferido no `ListAgents` de 29/09/2026, 06:04; o ref `81e1ea` de 28/09 morreu no reinício) | a mesma Ficha I. Lote 3 em obra. Trabalha em turnos (P60): só quando o Planejador chamar |

## 29/09/2026, 09:34 — o chat D assina de novo, depois do reinício da máquina

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor (chat D) | EXECUTANDO · árvore, malha e linha do tempo | `EXECUTANDO · árvore, malha e linha do tempo` (ref `e8e05f`, conferido no `ListAgents` de 29/09/2026, 09:34; o ref `3f113a` morreu no reinício das 05:58) | a mesma Ficha D. Fechou a v23.1 (lote 1). Lote 2a pronto; lote 2b pela metade. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 09:34 — EXECUTANDO · animações, prévia e curvas assinou de novo (chat G), depois do reinício

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat G) | EXECUTANDO · animações, prévia e curvas | `EXECUTANDO · animações, prévia e curvas` (ref **`0d92fa`**, conferido no `ListAgents` de 29/09, 09:34; **a ref `7f500f` morreu** no reinício das 05:58 — se o nome falhar, tente a ref) | a Ficha G, lote 3. Feitos e medidos: Q1, K1, Q2, K14, K2, Q3, P33 (seção no CHANGELOG, 05:25) e P18, K6, K7 (seção no CHANGELOG, 09:34). Faltam: as fotos do P18/K7, Q4 (Prévia), Q5–Q7 + K9 (Curvas) e P28 (menu com a aba fechada). Porta **5207**, um servidor só, e só no turno dele (P60). Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 09:34 — EXECUTANDO · cena e ferramentas assinou de novo (chat F), depois do reinício

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat F) | EXECUTANDO · cena e ferramentas | `EXECUTANDO · cena e ferramentas` (ref **`831050`**, conferido no `ListAgents` de 29/09, 09:34; o ref `d1f2f2` da linha de 28/09 morreu com o reinício das 05:58) | o mesmo da linha de 28/09: a Ficha F. Versão A do lote 3 entregue (F1, F2, F3, A4, H3, L10, L11); falta a versão B (K10, J2, J11, L15, N-4) e duas fotos. Reporta ao `PLANEJADOR · 9f75b5` |

**29/09/2026, 09:34 — o chat C mudou de endereço outra vez:** `EXECUTANDO · as portas das regras` agora é ref **`e195e7`** (conferido no `ListAgents` de 09:34). O `565f89` das 06:04 morreu. O Planejador segue `367d95`.

## 29/09/2026, 09:37 — EXECUTANDO · imagens e pivô assinou de novo (chat H)

O computador reiniciou às 05:57; o endereço mudou.

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Executor (chat H) | EXECUTANDO · imagens e pivô | `EXECUTANDO · imagens e pivô` (ref `e8005d`, conferido no `ListAgents` de 29/09, 09:37; a ref de antes, `ad08e1`, morreu no reinício) | a mesma **Ficha H**: trazer a arte e marcar o pivô. Lote 3 no disco desde 05:24, com seção no `CHANGELOG` (versão do fecho 2). Espera: o conserto do chat E (H1, H2, P15) e as fotos do K15 e do K12 no turno seguinte. Porta **5208**. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 09:58 — USO · animar um ciclo de andar assinou de novo (chat K, depois do reinício)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Uso (chat K) | USO · animar um ciclo de andar | `USO · animar um ciclo de andar` (ref **`9a3da9`**, conferido no `ListAgents` de 29/09/2026, 09:58; a ref `b547b4` morreu no reinício) | refaz a fila "animar um ciclo de andar" no `programa/` **v23.2** e confere K1 a K15 (consertado · não · pela metade). **Não escreve código.** Um servidor na 5311, Chrome sem janela, medindo a memória antes de abrir. Fotos em `backup/fotos-rodada-final/uso-animar/v23.2/`. Reporta ao `PLANEJADOR · 9f75b5` |


## 29/09/2026, 09:58 — EXECUTANDO · arquivo e importar assinou de novo (chat E, turno 1)

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor (chat E) | EXECUTANDO · arquivo e importar | `EXECUTANDO · arquivo e importar` (ref **`1c0385`**, conferido no `ListAgents` de 29/09, 09:58; o de 28/09, `1d68ed`, **morreu** no reinício das 05:58) | Ficha E, turno 1 (P60): as fotos da v23.2 (Spriter visível, folha do Aseprite, sequência salva e reaberta), H1+H2 (o pivô, P15), J1, N-6, `problemsQuestion` (P43). Porta **5204**. Régua da memória (P63): mede antes de cada comando, um processo de cada vez. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 09:58 — PESQUISA · onde fica cada botão assinou de novo (chat O)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Pesquisa (chat O) | PESQUISA · onde fica cada botão | `PESQUISA · onde fica cada botão` (ref `691f86`, conferido no `ListAgents` de 29/09/2026, 09:58; o endereço anterior, `c39a0e`, **morreu** com o reinício das 05:57; antes do título era `Pesquisar O: onde fica cada botão`) | continua o chat O: (1) o mapa `documentos/pesquisa/nova pesquisa/ONDE FICA CADA BOTAO 2026-09-29.md`; (2) **mantém a fila** `documentos/planos/FILA dos defeitos 2026-09-29.md` (P34), o **único** que escreve nela; os donos avisam o fecho a ele. **Não escreve código.** Só lê `editor/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 10:06 — USO · peles e troca de roupa assinou de novo (chat M, depois do reinício)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Uso (chat M) | USO · peles e troca de roupa | `USO · peles e troca de roupa` (ref `b060c3`, conferido no `ListAgents` de 29/09/2026, 10:05; **o endereço antigo `8f01e9` morreu no reinício**) | refaz a fila "peles e troca de roupa" na **v23.2** e confere os 16 defeitos M1–M16 (consertado · não consertado · pela metade), na seção "Conferência na v23.2" de `documentos/pesquisa/nova pesquisa/SEQUENCIA peles e troca de roupa 2026-09-28.md`. **Não escreve código.** Régua da memória (P63): mede antes de abrir; um servidor só (porta 5313, PID guardado); Chrome sem janela, seletores trocados; nenhuma janela do Windows. Fotos em `backup/fotos-rodada-final/uso-peles/v23.2/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 10:22 — USO · do zero ao boneco montado reassinou (chat J)

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| Uso (chat J) | USO · do zero ao boneco montado | `USO · do zero ao boneco montado` (ref `d11f1a`, conferido no `ListAgents` de 29/09/2026, 10:22; **o endereço antigo `28d601` morreu no reinício das 05:57**) | refaz a fila "do zero ao boneco montado" na **v23.2** e confere os defeitos J1–J15 (consertado / não / pela metade). Chrome sem janela, servidor único na 5310 com PID guardado, sem janela do Windows. **Não escreve código.** Fotos em `backup/fotos-rodada-final/uso-boneco/v23.2/`. Reporta ao `PLANEJADOR · 9f75b5` |

## 29/09/2026, 14:35 — Arquitetura do programa assinou

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| sem papel dado ainda — conversa de **projeto do programa** com o Humberto | Arquitetura do programa | `Arquitetura do programa` (ref `ca2414`, conferido no `ListAgents` de 29/09/2026, 14:30) | o Humberto abriu esta janela para **sentar e projetar o programa como ele quer**, porque o programa cresceu para vários lados. **Não escreve código.** Só lê `editor/`. O que sair daqui vai para documento em `documentos/`, com data no nome. O Humberto fala direto nesta janela |

`ListAgents` de 29/09, 14:30: os chats da rodada final estão todos **ociosos** (Planejador `367d95`, executores, usos e a pesquisa O). Quatro estão fora do ar (`a tela que cabe`, `partículas que se acham`, `malha e pesos`, `exportar e entregar`).

## 29/09/2026, 14:40 — OBRA PARADA: o Humberto vai projetar o programa

Palavra dele na janela `Arquitetura do programa`: *"o programa cresceu indo para várias direções. Eu quero sentar e projetar como eu quero o programa."* A proposta foi parar a obra enquanto se projeta; ele aprovou.

| Pode | Não pode |
|:---|:---|
| ler `editor/src` à vontade | escrever nele |
| escrever documento em `documentos/` | abrir lote, chamar turno, fechar versão |

A **v23.3** fica como está. Volta com a palavra dele. Avisado ao `PLANEJADOR · 9f75b5` por mensagem, às 14:40.

## 03/10/2026, 13:50 — EXECUTANDO · plano para terminar o programa assinou

| Papel | Janela | Endereço | O que faz |
|:---|:---|:---|:---|
| escreve o plano de como terminar, a pedido direto do Humberto | EXECUTANDO · plano para terminar o programa | `Remote control` (ref `ed2cab`, conferido no `ListAgents` de 03/10/2026, 13:45; o título mudou depois — se um falhar, tente o outro) | escreveu `documentos/planos/PLANO como terminar o programa 2026-10-03.md`: cinco fases (a peneira · a tela desenhada · a ordem da obra · a obra · o fecho). **Não escreve código.** A obra continua parada na v23.3 até a palavra do Humberto. O Humberto fala direto nesta janela |

`ListAgents` de 03/10, 13:45: deste projeto, vivo só o `PLANEJADOR · 9f75b5` (ref `de9651`, ocioso). Fora do ar: `a tela que cabe`, `partículas que se acham`, `malha e pesos`, `exportar e entregar`.

## 04/10/2026 — os chats do projeto foram arquivados; a obra passa a ser por rodadas

Ordem do Humberto na janela `EXECUTANDO · plano para terminar o programa`: *"arquive os outros chats desse projeto"*.

**Arquivados (18):** PLANEJADOR · 9f75b5 · Arquitetura do programa · PESQUISA · onde fica cada botão · EXECUTANDO: as portas das regras, a casca, arquivo e importar, imagens e pivô, animações prévia e curvas, exibição peles e histórico, árvore malha e linha do tempo, cena e ferramentas, partículas que se acham, a tela que cabe · USO: do zero ao boneco montado, peles e troca de roupa, animar um ciclo de andar, malha e pesos, exportar e entregar.

**Não arquivados:** `Progresso do trabalho` (usado hoje) e `O que você sabe sobre mim`. Esperam a palavra do Humberto.

**Não há mais Planejador nem Diretor.** A obra é por rodadas: uma rodada, um chat. O Humberto passa cada rodada a um chat novo. Quem chega lê `documentos/projeto do programa/03 A ORDEM DA OBRA 2026-10-04.md`, assina aqui, e põe o título `EXECUTANDO · rodada N — nome`. Os endereços de todas as tabelas acima estão mortos.

## 04/10/2026, noite — correção: HÁ um Diretor. `DIRETOR · ed2cab`

A frase acima ("não há mais Planejador nem Diretor") foi escolha do chat, não do Humberto. Ele corrigiu: *"você é o diretor, orquestre o programa."*

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Diretor** | DIRETOR · ed2cab | `DIRETOR · ed2cab` (ref `ed2cab`; antes do título era `EXECUTANDO · plano para terminar o programa` e `Remote control` — se um falhar, tente o outro) | fala com o Humberto · confere o que cada rodada entregou, **usando o programa** · ajusta a ordem no `03` · escreve a ficha da rodada seguinte em `documentos/projeto do programa/rodadas/`. **Não escreve código** |
| Executor | EXECUTANDO · rodada N — nome | (assina ao abrir) | um chat novo por rodada. Faz só a rodada dele e **reporta ao Diretor** |

Caminho: `Executor da rodada → DIRETOR → Humberto`. **Não há Planejador**: com um executor por vez, seria papel dobrado. O Diretor se troca a cada cinco rodadas, mais ou menos; o novo começa lendo o `02` e o `03`.

## 04/10/2026, 20:20 — EXECUTANDO · rodada 1 — conferir conexão e skin assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 1 | EXECUTANDO · rodada 1 — conferir conexão e skin | `EXECUTANDO · rodada 1 — conferir conexão e skin` (ref `ec16bc`, conferido no `ListAgents` de 04/10/2026, 20:12) | confere no uso, no `programa/` montado (porta 5320), os 25 pontos da conexão e os 13 da skin. **Não escreve código.** Entrega `documentos/projeto do programa/04 O QUE JA FAZ 2026-10-04.md`. Reporta ao `DIRETOR · ed2cab` |

## 04/10/2026, 20:15 — PESQUISA · rodada 14 — as partículas assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 14 | PESQUISA · rodada 14 — as partículas | `PESQUISA · rodada 14 — as partículas` (ref `54acad`, conferido no `ListAgents` de 04/10/2026, 20:15; antes do título era `Fazer a rodada 14: a pesquisa das partículas` — se um falhar, tente o outro) | pesquisa as partículas do Construct 3 e do Godot (fonte oficial, com link), o mapa do Niagara, e o que o formato e o editor já têm. **Não escreve código, não abre o programa, não roda testes.** Entrega `documentos/projeto do programa/06 AS PARTICULAS - pesquisa e proposta <data>.md`. Reporta ao `DIRETOR · ed2cab` |


## 04/10/2026, 20:15 — EXECUTANDO · rodada 5 — o desenho dos menus assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 5 | EXECUTANDO · rodada 5 — o desenho dos menus | `EXECUTANDO · rodada 5 — o desenho dos menus` (ref `456785`, conferido no `ListAgents` de 04/10/2026, 20:15; antes do título era `Fazer a rodada 5: o desenho dos menus` — se um falhar, tente o outro) | desenha a barra de menus nova, para o Humberto riscar. **Não escreve código, não abre o programa, não roda testes.** Entrega `documentos/projeto do programa/05 O DESENHO DOS MENUS 2026-10-04.md`. Reporta ao `DIRETOR · ed2cab` |
## 04/10/2026, 20:40 — EXECUTANDO · rodada 8a — a entidade se escolhe, se move e volta assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 8a | EXECUTANDO · rodada 8a — a entidade se escolhe, se move e volta | `EXECUTANDO · rodada 8a — a entidade se escolhe, se move e volta` (ref `ddf078`, conferido no `ListAgents` de 04/10/2026, 20:38; antes do título era `Fazer a rodada 8a: a entidade se escolhe, se move e volta` — se um falhar, tente o outro) | **escreve código**, e é o único que escreve e usa a máquina agora. A entidade encaixada se escolhe com um clique na cena, o botão direito abre a grade sobre ela, ela volta a ser imagem, ela se move, gira e escala com chave, Propriedades e Ordem dizem o nome dela, e o aviso das chaves que não passam sai em português. **Não toca** `runtime/`, `runtime-python/`, `documentos/manual/`, a faixa (8c), a lista de bases (8b), o emissor (15) nem os menus (6). Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 04/10, 20:38: vivos neste projeto `DIRETOR · ed2cab` (ref `9f97e2`, ocioso) e `EXECUTANDO · rodada 1 — conferir conexão e skin` (ref `ec16bc`, ocioso).

## 04/10/2026, 21:14 — EXECUTANDO · rodada 8d — mover a imagem cria chave assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 8d | EXECUTANDO · rodada 8d — mover a imagem cria chave | `EXECUTANDO · rodada 8d — mover a imagem cria chave` (ref `006e8a`, conferido no `ListAgents` de 04/10/2026, 21:14; antes do título era `Fazer a rodada 8d: mover a imagem cria chave, como no Spriter` — se um falhar, tente o outro) | **escreve código**, e é o único que escreve e usa a máquina agora. Clicar numa imagem na cena escolhe só a imagem; movê-la numa animação cria chave só dela, sem mexer no osso nem nas outras imagens do osso, como no Spriter; vale igual para a peça encaixada. Por dentro, um osso só da imagem, escondido da Árvore. Primeiro o plano ao Diretor, depois o código. **Não toca** `runtime/`, `runtime-python/`, `formato/`, `documentos/manual/`, a faixa (8c), a lista de bases (8b), o emissor (15) nem os menus (6). Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 04/10, 21:14: vivo neste projeto, além desta janela, só o `DIRETOR · ed2cab` (ref `9f97e2`, ocioso).

## 04/10/2026, 22:08 — EXECUTANDO · rodada 12 — a skin que falta assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 12 | EXECUTANDO · rodada 12 — a skin que falta | `EXECUTANDO · rodada 12 — a skin que falta` (ref `65f564`, conferido no `ListAgents` de 04/10/2026, 22:08; antes do título era `RESERVA 1 · Recorte` — se um falhar, tente o outro) | **escreve código.** Esconder imagem na skin (S4), ignorar por imagem (S3), o osso some junto quando a skin sai (S8), apagar osso da base só na skin em edição (S9, plano ao Diretor antes), provas S11 e S12. **Não toca** `runtime/`, `runtime-python/`, `formato/`, `documentos/manual/`, a conexão (8), os menus (6). Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 04/10, 22:08: vivos neste projeto `DIRETOR · ed2cab` (ref `9f97e2`, ocupado), `EXECUTANDO · rodada 8d — mover a imagem cria chave` (ref `006e8a`, ocupado) e as `RESERVA 2` a `5` (ociosas).

## 04/10/2026, 22:39 — EXECUTANDO · rodada 15 — partículas: usar o emissor assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 15 | EXECUTANDO · rodada 15 — partículas: usar o emissor | `EXECUTANDO · rodada 15 — partículas: usar o emissor` (ref `3e3e8d`, conferido no `ListAgents` de 04/10/2026, 22:39; antes do título era `RESERVA 2 · Recorte` — se um falhar, tente o outro) | **escreve código** no editor, no formato e nos dois runtimes, e é o único que escreve e usa a máquina agora. Achar, clicar, mover, girar e prender o emissor; x, y e rotation do emissor no formato (plano ao Diretor antes). Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 04/10, 22:39: vivos neste projeto `DIRETOR · ed2cab` (ref `9f97e2`, ocupado), `EXECUTANDO · rodada 12 — a skin que falta` (ref `65f564`, ocioso) e as `RESERVA 3` a `5` (ociosas).

## 04/10/2026, 23:36 — EXECUTANDO · rodada 3 — o que perde trabalho assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 3 | EXECUTANDO · rodada 3 — o que perde trabalho | `EXECUTANDO · rodada 3 — o que perde trabalho` (ref `57c42a`, conferido no `ListAgents` de 04/10/2026, 23:35; antes do título era `RESERVA 3 · Recorte` — se um falhar, tente o outro) | **escreve código**, e é o único que escreve e usa a máquina agora. Três defeitos, um lote cada: J9 (digitar 90 no Ângulo não gira), M17 (a skin exportada não volta ao importar), E6 (o projeto grande do Spriter trava). Prova antes que o defeito existe, com foto. Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 04/10, 23:35: vivos neste projeto `DIRETOR · ed2cab` (ref `9f97e2`, ocupado) e as `RESERVA 4` e `5` (ociosas).

## 05/10/2026, 00:28 — EXECUTANDO · rodada 6 — os menus assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 6 | EXECUTANDO · rodada 6 — os menus | `EXECUTANDO · rodada 6 — os menus` (ref `c36797`, conferido no `ListAgents` de 05/10/2026, 00:28; antes do título era `RESERVA 4 · Recorte` — se um falhar, tente o outro) | **escreve código**, e é o único que escreve e usa a máquina agora. Constrói o desenho do `05`: a barra de 12 menus (Esqueleto vira Base), as 30 portas e os (novo) que já existem, e as palavras (pele → skin, corpo → base, só no texto que o usuário lê). Três lotes, uma versão e fotos por lote. Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 05/10, 00:28: vivos neste projeto `DIRETOR · ed2cab` (ref `9f97e2`, ocupado) e a `RESERVA 5` (ociosa).

## 05/10/2026, 01:30 — EXECUTANDO · rodadas 8b e 8c — a entidade na lista e a faixa assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor das rodadas 8b e 8c | EXECUTANDO · rodadas 8b e 8c — a entidade na lista e a faixa | `EXECUTANDO · rodadas 8b e 8c — a entidade na lista e a faixa` (ref `59c3f0`, conferido no `ListAgents` de 05/10/2026, 01:29; antes do título era `RESERVA 5 · Recorte` — se um falhar, tente o outro) | **escreve código**, e é o único que escreve e usa a máquina agora. A entidade cai onde foi solta, aparece na lista de Animações como base, com as animações dela; a entidade dentro de entidade; o salto da espada; a faixa estica, arrasta, tem laço e aviso da emenda. Um lote por vez, uma versão por lote. Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 05/10, 01:29: vivo neste projeto, além desta janela, só o `DIRETOR · ed2cab` (ref `9f97e2`, ocupado).

## 05/10/2026, 04:05 — CONFERINDO · rodada 21 — a noite, no uso assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Conferente da rodada 21 | CONFERINDO · rodada 21 — a noite, no uso | `CONFERINDO · rodada 21 — a noite, no uso` (ref `380317`, conferido no `ListAgents` de 05/10/2026, 04:05; antes do título era `RESERVA 8 · Recorte` — se um falhar, tente o outro) | **não escreve código.** Usa o `programa/` montado (v25.7), faz o gesto de verdade, fotografa e anota defeito sem consertar. É o único que usa a máquina agora. Entrega `documentos/projeto do programa/07 A NOITE CONFERIDA <data>.md` |

`ListAgents` de 05/10, 04:05: vivos neste projeto, além desta janela, `DIRETOR · ed2cab` (ref `9f97e2`, ocupado), `RESERVA 6` e `RESERVA 7` (ociosas).

## 05/10/2026, 04:07 — PESQUISA · rodada 22 — os leitores: Godot e Construct assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Pesquisa da rodada 22 | PESQUISA · rodada 22 — os leitores: Godot e Construct | `PESQUISA · rodada 22 — os leitores: Godot e Construct` (ref `67310c`, conferido no `ListAgents` de 05/10/2026, 04:05; antes do título era `RESERVA 7 · Recorte` — se um falhar, tente o outro) | **não escreve código, não abre o programa, não roda testes.** Pesquisa como fazer o leitor do `.bone` no Godot 4 e no Construct 3 (LTS r449). Entrega `documentos/projeto do programa/08 OS LEITORES - Godot e Construct <data>.md`. Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 05/10, 04:05: vivos neste projeto, além desta janela, `DIRETOR · ed2cab` (ref `9f97e2`, ocupado), `CONFERINDO · rodada 21` (ref `380317`, ocupado) e `RESERVA 6` (ociosa).

## 05/10/2026, 04:33 — EXECUTANDO · rodadas K1 e K2 — o leitor do Construct assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor das rodadas K1 e K2 | EXECUTANDO · rodadas K1 e K2 — o leitor do Construct | `EXECUTANDO · rodadas K1 e K2 — o leitor do Construct` (ref `2e58f6`, conferido no `ListAgents` de 05/10/2026, 04:33; antes do título era `RESERVA 6 · Recorte` — se um falhar, tente o outro) | **escreve código numa pasta nova** (o leitor do Construct). K1: o `runtime/` num `.js` só, os 90 casos sobre ele, o addon vazio. K2: o objeto Recorte carrega, desenha com `drawMesh` e toca. **Não toca** `runtime/` (só acrescenta), `editor/`, `programa/`, `formato/`. Não roda suíte inteira, roteiro, medição nem montagem até o Diretor liberar. Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 05/10, 04:33: vivos neste projeto, além desta janela, `DIRETOR · ed2cab` (ref `9f97e2`, ocupado) e `CONFERINDO · rodada 21 — a noite, no uso` (ref `380317`, ocupado).


## 05/10/2026, 04:52 — EXECUTANDO · rodada 23 — os consertos da noite assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 23 | EXECUTANDO · rodada 23 — os consertos da noite | `EXECUTANDO · rodada 23 — os consertos da noite` (ref `05282e`, conferido no `ListAgents` de 05/10/2026, 04:49; antes do título era `RESERVA 9 · Recorte` — se um falhar, tente o outro) | **escreve código no editor**, e é o único que escreve em `editor/` e fecha versão agora. Conserta os 13 defeitos do `07 A NOITE CONFERIDA`, na ordem da ficha: Delete numa chave apaga o osso (1), a espada solta não acompanha (6), seleção fantasma (3), o Ângulo fora do painel (4), Pôr entidade na cena (5), tecla P (7), as palavras, os pequenos. **Não toca** `leitor-construct/`, `formato/`, runtimes, `documentos/manual/`, os painéis da rodada 4. Não monta `programa/` antes das 05h40. Reporta ao `DIRETOR · ed2cab` |


## 05/10/2026, 04:48 — EXECUTANDO · rodada 4 — os painéis do Photoshop assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 4 | EXECUTANDO · rodada 4 — os painéis do Photoshop | `EXECUTANDO · rodada 4 — os painéis do Photoshop` (ref `de6a44`, conferido no `ListAgents` de 05/10/2026, 04:48; antes do título era `RESERVA 10 · Recorte` — se um falhar, tente o outro) | **parte 1, sem escrever em `editor/`:** como o Photoshop faz cada gesto com painel (com link), o mesmo gesto no `programa/` montado (v25.7, porta 5322, Chrome sem janela 9422), fotos em `backup/fotos-obra/rodada-04/`, e o plano em `documentos/projeto do programa/09 OS PAINEIS - conferidos e o plano <data>.md`. A parte 2 (construir) só com o "pode" do Diretor. Reporta ao `DIRETOR · ed2cab` |

`ListAgents` de 05/10, 04:48: vivos neste projeto, além desta janela, `DIRETOR · ed2cab` (ref `9f97e2`, ocupado), `EXECUTANDO · rodadas K1 e K2 — o leitor do Construct` (ref `2e58f6`, ocupado) e `RESERVA 9 · Recorte` (ref `05282e`, ocupada).

## 05/10/2026, 06:42 — o cargo de Diretor passou: DIRETOR · 000da3 assinou

Ordem do Humberto, 05/10, de manhã. A ficha do cargo é `documentos/projeto do programa/10 PASSAGEM DE CARGO do Diretor 2026-10-05.md`.

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Diretor** | DIRETOR · 000da3 | `DIRETOR · 000da3` (ref `000da3`, conferido no `ListAgents` de 05/10/2026, 06:41; antes do título era `Abrir o chat do NOVO DIRETOR do Recorte` — se um falhar, tente o outro) | fala com o Humberto · confere cada rodada · escreve as fichas · troca os modelos. **Não escreve código.** Todo chat de rodada reporta a ele |
| Diretor antigo | DIRETOR · ed2cab | `DIRETOR · ed2cab` (ref `9f97e2`) | passou o cargo. **Não é mais a porta.** Será arquivado |

`ListAgents` de 05/10, 06:41: vivos neste projeto, além desta janela, `DIRETOR · ed2cab` (ocupado), `EXECUTANDO · rodada 4 — os painéis do Photoshop` (ref `de6a44`, ocupado) e `EXECUTANDO · rodadas K1 e K2 — o leitor do Construct` (ref `2e58f6`, ocioso). Reservas abertas: 11 e 12.

## 05/10/2026, 06:43 — EXECUTANDO · rodadas G1 e G2 — o leitor do Godot assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor das rodadas G1 e G2 | EXECUTANDO · rodadas G1 e G2 — o leitor do Godot | `EXECUTANDO · rodadas G1 e G2 — o leitor do Godot` (ref `63e4d5`, conferido no `ListAgents` de 05/10/2026, 06:43; antes do título era `RESERVA 11 · Recorte` — se um falhar, tente o outro) | **escreve código numa pasta nova, `leitor-godot/`**: o addon do Godot em GDScript, copiado de `runtime-python/`. G1: ler e desenhar parado, adaptador sem janela, casos A. G2: animações, `tocar("andar")`, casos A e X, exemplo, `LEIA-ME.md`. **Não toca** `editor/`, `programa/`, runtimes, `formato/`, `leitor-construct/`. Sem suíte inteira, roteiro, medição, montagem nem versão. Reporta ao `DIRETOR · 000da3` |

`ListAgents` de 05/10, 06:43: vivos neste projeto, além desta janela, `DIRETOR · 000da3` (ocupado), `DIRETOR · ed2cab` (ocioso), `EXECUTANDO · rodada 4 — os painéis do Photoshop` (ref `de6a44`, ocupado) e as reservas 12 a 19 (ociosas).

## 05/10/2026, 06:45 — CONFERINDO · rodada 24 — os consertos e os painéis assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Conferente da rodada 24 | CONFERINDO · rodada 24 — os consertos e os painéis | `CONFERINDO · rodada 24 — os consertos e os painéis` (ref `063316`, conferido no `ListAgents` de 05/10/2026, 06:45; antes do título era `RESERVA 12 · Recorte` — se um falhar, tente o outro) | **não escreve código, não conserta.** Só usa o `programa/` montado, fotografa e anota: os 13 defeitos da rodada 23 (parte A) e os painéis da rodada 4 (parte B). Entrega `documentos/projeto do programa/11 OS CONSERTOS E OS PAINEIS CONFERIDOS <data>.md`. Só abre o programa quando o Diretor mandar o "pode". Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 07:04 — EXECUTANDO · rodada 13 — base e pivô assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 13 | EXECUTANDO · rodada 13 — base e pivô | `EXECUTANDO · rodada 13 — base e pivô` (ref `83173f`, conferido no `ListAgents` de 05/10/2026, 07:04; antes do título era `RESERVA 13 · Recorte` — se um falhar, tente o outro) | **escreve código em `editor/`** (a única rodada que escreve ali e fecha versão enquanto roda): peça tirada da base guarda as chaves e as devolve quando volta; mudar o pivô de imagem presa a osso não mexe o desenho. Ficha: `documentos/projeto do programa/rodadas/RODADA 13 - base e pivo 2026-10-05.md`. Primeiro turno só de leitura; obra só com o "pode". Reporta ao `DIRETOR · 000da3` |

`ListAgents` de 05/10, 07:04: vivos neste projeto, além desta janela, `DIRETOR · 000da3` (ocupado), `EXECUTANDO · rodadas G1 e G2 — o leitor do Godot` (ocupado), `CONFERINDO · rodada 24 — os consertos e os painéis` (ocupado), `EXECUTANDO · rodada 4 — os painéis do Photoshop` (ocioso) e as reservas 14 a 19 (ociosas).

## 05/10/2026, 07:33 — EXECUTANDO · rodadas G6 e G7 — o leitor do Godot assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor das rodadas G6 e G7 | EXECUTANDO · rodadas G6 e G7 — o leitor do Godot | `EXECUTANDO · rodadas G6 e G7 — o leitor do Godot` (ref `e2c149`, conferido no `ListAgents` de 05/10/2026, 07:33; antes do título era `RESERVA 21 · Recorte` — se um falhar, tente o outro) | **escreve código só em `leitor-godot/`**: G6 regras, G7 partículas, pela ficha `documentos/projeto do programa/rodadas/RODADA G6 e G7 - o leitor do Godot regras e particulas 2026-10-05.md`. Não toca `editor/`, `programa/`, runtimes, `formato/`, `leitor-construct/`. Sem suíte da casa, roteiro, medição, montagem nem versão. Reporta ao `DIRETOR · 000da3` |

`ListAgents` de 05/10, 07:33: vivos neste projeto, além desta janela, `DIRETOR · 000da3` (ocupado), `EXECUTANDO · o leitor do Godot (G1 a G7)` (ref `63e4d5`, ocupado), `EXECUTANDO · rodada 13 — base e pivô` (ocupado), `CONFERINDO · rodada 24 — os consertos e os painéis` (ocupado), `EXECUTANDO · rodada 4 — os painéis do Photoshop` (ocioso).

## 05/10/2026, 07:38 — PLANEJANDO · rodada 11 — Este boneco assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 11 | PLANEJANDO · rodada 11 — Este boneco | `PLANEJANDO · rodada 11 — Este boneco` (ref `35f718`, conferido no `ListAgents` de 05/10/2026, 07:37; antes do título era `RESERVA 22 · Recorte` — se um falhar, tente o outro) | **parte 1: só o plano, nenhum código.** Escreve `documentos/projeto do programa/12 ESTE BONECO - o plano 2026-10-05.md` pela ficha `rodadas/RODADA 11 - Este boneco 2026-10-05.md`. Não toca `editor/`, `runtime/`, `runtime-python/`, `formato/`, `conformidade/` até o "pode". Reporta ao `DIRETOR · 000da3` |

`ListAgents` de 05/10, 07:37: vivos neste projeto, além desta janela, `DIRETOR · 000da3` (ocupado), `EXECUTANDO · o leitor do Godot (G1 a G7)` (ref `63e4d5`, ocioso), `EXECUTANDO · rodadas G6 e G7 — o leitor do Godot` (ocupado), `EXECUTANDO · rodada 13 — base e pivô` (ocupado), `CONFERINDO · rodada 24 — os consertos e os painéis` (ocupado), `EXECUTANDO · rodada 4 — os painéis do Photoshop` (ocioso).

## 05/10/2026, 11:20 — EXECUTANDO · rodada 11, lote 3 — Este boneco no Python assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 11, lote 3 | EXECUTANDO · rodada 11, lote 3 — Este boneco no Python | `EXECUTANDO · rodada 11, lote 3 — Este boneco no Python` (ref `63eaf2`, conferido no `ListAgents` de 05/10/2026, 11:19; antes do título era `RESERVA 23 · Recorte`) | "Este boneco" no runtime Python, só pelo texto da spec (regra 26). Escreve só em `runtime-python/`. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 11:31 — EXECUTANDO · rodada K5 — a conexão no Construct assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada K5 | EXECUTANDO · rodada K5 — a conexão no Construct | `EXECUTANDO · rodada K5 — a conexão no Construct` (ref `c9d9e3`, conferido no `ListAgents` de 05/10/2026, 11:31; antes do título era `RESERVA 24 · Recorte`) | A conexão (encaixar, desencaixar, em volta, osso seguido) no leitor do Construct, pela ficha `rodadas/RODADA K5 - a conexao no leitor do Construct 2026-10-05.md`. Escreve só em `leitor-construct/`. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 12:01 — EXECUTANDO · rodada G5 — a conexão no Godot assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada G5 | EXECUTANDO · rodada G5 — a conexão no Godot | `EXECUTANDO · rodada G5 — a conexão no Godot` (ref `8d5e03`, conferido no `ListAgents` de 05/10/2026, 12:01; antes do título era `RESERVA 25 · Recorte`) | A conexão (entidade aninhada, virada de corpo, em volta, encaixar) no leitor do Godot, pela ficha `rodadas/RODADA G5 - a conexao no leitor do Godot 2026-10-05.md`. Escreve só em `leitor-godot/`. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 15:42 — PLANEJANDO · rodada 16 — partículas: o sistema assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Planejador da rodada 16 | PLANEJANDO · rodada 16 — partículas: o sistema | `PLANEJANDO · rodada 16 — partículas: o sistema` (ref `6e5cf8`, conferido no `ListAgents` de 05/10/2026, 15:42; antes do título era `RESERVA 26 · Recorte`) | Parte 1: o plano e o desenho da ficha de partículas, pela ficha `rodadas/RODADA 16 - particulas o sistema 2026-10-05.md`. Sem código. Escreve em `documentos/projeto do programa/`. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 16:09 — o planejador da rodada 16 virou EXECUTANDO · rodada 16 — partículas

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 16 | EXECUTANDO · rodada 16 — partículas | `EXECUTANDO · rodada 16 — partículas` (ref `6e5cf8`; antes `PLANEJANDO · rodada 16 — partículas: o sistema`) | Lotes 1 a 6 do plano `16 AS PARTICULAS - o plano 2026-10-05.md`. Escreve em `editor/`. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 17:47 — a reserva 27 virou EXECUTANDO · rodada 16, lote 7

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 16, lote 7 | EXECUTANDO · rodada 16, lote 7 — o caminho no formato | `EXECUTANDO · rodada 16, lote 7 — o caminho no formato` (ref `198fe5`, conferido no `ListAgents` de 05/10/2026, 17:47; antes `RESERVA 27 · Recorte`) | Partículas "ao longo de um caminho": formato, casos P-021 a P-025, runtime TS. Escreve em `formato/`, `conformidade/casos/`, `ferramentas/src/`, `runtime/`. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 18h14 — a reserva 28 virou EXECUTANDO · rodada 16, lote 7b

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 16, lote 7b | EXECUTANDO · rodada 16, lote 7b — o caminho no Python | `EXECUTANDO · rodada 16, lote 7b — o caminho no Python` (ref `c0b466`, conferido no `ListAgents` de 05/10/2026, 18h14; antes `RESERVA 28 · Recorte`) | Partículas "ao longo de um caminho" no runtime Python, só pela spec. Escreve em `runtime-python/`. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 18h47 — a reserva 29 virou EXECUTANDO · rodadas 7 e 9

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor das rodadas 7 e 9 | EXECUTANDO · rodadas 7 e 9 — a pasta e o slot | `EXECUTANDO · rodadas 7 e 9 — a pasta e o slot` (ref `6c4005`, conferido no `ListAgents` de 05/10/2026, 18h47; antes `RESERVA 29 · Recorte`) | Rodada 7 (pedir a pasta ao começar) e rodada 9 (o slot vira base). Escreve em `editor/`. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 18:58 — EXECUTANDO · rodada G9 — o caminho no Godot assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada G9 | EXECUTANDO · rodada G9 — o caminho no Godot | `EXECUTANDO · rodada G9 — o caminho no Godot` (ref `f30103`, conferido no `ListAgents` de 05/10/2026, 18:58; é a mesma janela da G5, que era `8d5e03`) | As partículas ao longo de um caminho (§9.4.2) no leitor do Godot. Escreve só em `leitor-godot/`. Reporta ao `DIRETOR · 000da3` |
| Executor da rodada 34 | EXECUTANDO · rodada 34 — os casos que faltam | `EXECUTANDO · rodada 34 — os casos que faltam` (ref `5ec797`, conferido no `ListAgents` de 05/10/2026, 20:33) | Escreve os casos de conformidade que faltam em `conformidade/casos-pendentes/`, pela spec, sem consertar leitor. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 20h48 — o executor do lote 7 virou EXECUTANDO · rodada 35

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 35 | EXECUTANDO · rodada 35 — os consertos dos casos novos | `EXECUTANDO · rodada 35 — os consertos dos casos novos` (ref `198fe5`; antes `EXECUTANDO · rodada 16, lote 7 — o caminho no formato`) | Consertos do runtime TypeScript e da spec achados pelos casos C-324, C-326, P-029 (e três frases: §9.8/9.10, §7.7, §7.11/7.13). Escreve em `runtime/`, `formato/`, o leiame do C-262. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 21h05 — a reserva 16 virou PLANEJANDO · rodada 10

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Planejador da rodada 10 | PLANEJANDO · rodada 10 — a aba das entidades | `PLANEJANDO · rodada 10 — a aba das entidades` (ref `901762`, conferido no `ListAgents` de 05/10/2026, 21h05; antes `RESERVA 16 · Recorte`) | Pesquisa e plano da aba das entidades (o visualizador de montagem). Sem código. Reporta ao `DIRETOR · 000da3` |

## 05/10/2026, 21h37 — a reserva 14 virou EXECUTANDO · rodada 17 — os consertos da fila

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| Executor da rodada 17, parte 2 | EXECUTANDO · rodada 17 — os consertos da fila | `EXECUTANDO · rodada 17 — os consertos da fila` (ref `2865ec`, conferido no `ListAgents` de 05/10/2026, 21h37; antes `RESERVA 14 · Recorte`) | Os consertos da fila de 29/09 achados pelo conferente. Escreve em `editor/`. Reporta ao `DIRETOR · 000da3` |

## 06/10/2026, 07h15 — o cargo de Diretor passou: DIRETOR · Diretor com monitoramento de chats [410edc] assinou

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Diretor** | DIRETOR · Diretor com monitoramento de chats [410edc] | `Diretor com monitoramento de chats [410edc]` (ref `410edc`, conferido no `ListAgents` de 06/10/2026, 07h10) | fala com o Humberto · confere cada rodada · escreve as fichas · escolhe o modelo de cada chat · tem um **vigia** (cron a cada meia hora, minutos 17 e 47) que o impede de dormir. Não escreve código |
| Diretor antigo | DIRETOR · 000da3 | `DIRETOR · 000da3` (ref `ff888e`, ocioso) | passou o cargo. Não é mais a porta |
| Conferente | CONFERINDO · rodada 36 — os consertos da fila | `CONFERINDO · rodada 36 — os consertos da fila` (ref `3caf07`, ocioso) | conferiu a v29.9 (documento `25`) |

`ListAgents` de 06/10, 07h10: só estes dois chats do projeto, ambos ociosos.

## 06/10/2026, 07:09 — o cargo passa: DIRETOR · 000da3 → DIRETOR · 410edc

Ordem do Humberto. A ficha do cargo é `documentos/projeto do programa/11 PASSAGEM DE CARGO do Diretor 2026-10-06.md`.

| Papel | Janela | Endereço | Faz |
|:---|:---|:---|:---|
| **Diretor** | DIRETOR · 410edc (hoje: `DIRETOR · Diretor com monitoramento de chats [410edc]`) | `local_2c65f59d-5be7-4697-853c-b8d4cd88eb20` | fala com o Humberto · confere cada rodada · escreve as fichas · troca os modelos pelo esforço. **Não escreve código** |
| Diretor antigo | DIRETOR · 000da3 | — | passou o cargo. Será arquivado |

| Pesquisa | PESQUISANDO · rodada 38 — o polimento das partículas | `PESQUISANDO · rodada 38 — o polimento das partículas [6d38c3]` (ref `6d38c3`, conferido no `ListAgents` de 06/10/2026, 07h41) | rodada 38, parte 1: pesquisa e conferência das partículas. Escreve `27`. Sem código; espera o "pode" do Diretor |
| Reserva 33 | RESERVA 33 · Recorte | `RESERVA 33 · Recorte [668a31]` (ref `668a31`, conferido no `ListAgents` de 06/10/2026, 07h41) | chat de reserva. Sem ficha ainda; espera a ficha do `Diretor com monitoramento de chats [410edc]` por mensagem. Sem código |
| Reserva | RESERVA 34 · Recorte | `RESERVA 34 · Recorte [e76e8f]` (ref `e76e8f`, conferido no `ListAgents` de 06/10/2026, 07h41) | chat de reserva. Sem ficha ainda; espera a ficha do Diretor (`Diretor com monitoramento de chats [410edc]`) por mensagem. Sem código |
| Reserva 32 | RESERVA 32 · Recorte | `RESERVA 32 · Recorte [0c600d]` (ref `0c600d`, conferido no `ListAgents` de 06/10/2026, 07h40) | chat de reserva. Sem ficha ainda; espera a ficha do `Diretor com monitoramento de chats [410edc]` por mensagem. Sem código |
| Reserva | RESERVA 31 · Recorte | `RESERVA 31 · Recorte [4d8ce6]` (ref `4d8ce6`, conferido no `ListAgents` de 06/10/2026, 07h40) | chat de reserva. Espera a ficha do `Diretor com monitoramento de chats [410edc]`. Sem código até receber ficha |
| Execução | EXECUTANDO · rodada 39 — a aba das entidades | `EXECUTANDO · rodada 39 — a aba das entidades [d86858]` (ref `d86858`, conferido no `ListAgents` de 06/10/2026, 07h48) | rodada 39: a aba das entidades, plano `22`, sete lotes. **Escreve em `editor/`** (a única agora) e fecha versão. Reporta ao `Diretor com monitoramento de chats [410edc]` |
| Execução | EXECUTANDO · rodada 39b — a aba das entidades, lotes 6 e 7 | `EXECUTANDO · rodada 39b — a aba das entidades, lotes 6 e 7 [4d8ce6]` (ref `4d8ce6`, conferido no `ListAgents` de 06/10/2026, 09h50; antes `RESERVA 31 · Recorte`) | rodada 39b: as notas a–d do `34`, depois os lotes 6 e 7 do plano `22`. **Escreve em `editor/`** (a rodada 38 também, na parte dela; semáforo `backup/FECHO-EM-CURSO.txt`). Reporta ao `Diretor com monitoramento de chats [410edc]` |
| Pesquisa | PESQUISANDO · rodada 40 — o polimento da linha do tempo | `PESQUISANDO · rodada 40 — o polimento da linha do tempo [0c600d]` (ref `0c600d`, conferido no `ListAgents` de 06/10/2026, 12h05; antes `RESERVA 32 · Recorte`) | rodada 40, parte 1: pesquisa e conferência da linha do tempo. Escreve `39`. Sem código; espera o "pode" do Diretor |
| Pesquisa | PESQUISANDO · rodada 41 — o polimento da malha e dos pesos | `PESQUISANDO · rodada 41 — o polimento da malha e dos pesos [668a31]` (ref `668a31`, conferido no `ListAgents` de 06/10/2026, 12h31; antes `RESERVA 33 · Recorte`) | rodada 41, parte 1: pesquisa e conferência da malha e dos pesos. Escreve `43`. Portas 5480 (programa) e 9480 (Chrome sem janela). Sem código; espera o "pode" do Diretor |
| Executor da rodada 42 | EXECUTANDO · rodada 42 — as sobras das partículas e da aba | `EXECUTANDO · rodada 42 — as sobras das partículas e da aba [e76e8f]` (ref `e76e8f`, conferido no `ListAgents` de 06/10/2026, 12h51; antes `RESERVA 34 · Recorte`) | rodada 42: sobras das partículas (lote 1) e da aba das entidades (lote 2). Escreve em `editor/`. Portas 5490 (programa) e 9490 (Chrome sem janela). Reporta ao `Diretor com monitoramento de chats [410edc]` |
| Reserva 36 | RESERVA 36 · Recorte | `RESERVA 36 · Recorte [89519c]` (ref `89519c`, conferido no `ListAgents` de 06/10/2026, 14h05) | chat de reserva. Sem ficha ainda; espera a ficha do `Diretor com monitoramento de chats [410edc]` por mensagem. Sem código |
| Reserva | RESERVA 35 · Recorte | `RESERVA 35 · Recorte [8f8f2d]` (ref `8f8f2d`, conferido no `ListAgents` de 06/10/2026, 14h05) | chat de reserva. Sem ficha ainda; espera a ficha do `Diretor com monitoramento de chats [410edc]` por mensagem. Sem código |
| Reserva 37 | RESERVA 37 · Recorte | `RESERVA 37 · Recorte [374550]` (ref `374550`, conferido no `ListAgents` de 06/10/2026, 14h05) | chat de reserva. Sem ficha ainda; espera a ficha do `Diretor com monitoramento de chats [410edc]` por mensagem. Sem código |
| Execução | EXECUTANDO · rodada 43 — Árvore, Ordem e Propriedades | `EXECUTANDO · rodada 43 — Árvore, Ordem e Propriedades [e60278]` (ref `e60278`, conferido no `ListAgents` de 06/10/2026, 18h03; antes `304c71`, `8f8f2d` e `RESERVA 35 · Recorte`) | rodada 43 **terminada**: os 5 lotes do doc `51` fechados (v32.5, v32.6, v32.9, v33.2, v33.4). **Largou a máquina às 22h14**: nada em `editor/`, portas 5500 e 9500 desligadas |
| 06/10/2026, 17h18 — endereço novo da rodada 40 depois do reinício do aplicativo (14h13) | EXECUTANDO · rodada 40 — o polimento da linha do tempo | `EXECUTANDO · rodada 40 — o polimento da linha do tempo [773488]` (ref `773488`, conferido no `ListAgents` às 17h01; antes `0c600d`). O Diretor vivo é `[d9096b]` | rodada 40, parte 2: os 5 lotes fechados (v31.4, v31.5, v31.7, v32.0, v32.3). Reporta ao Diretor |
| Pesquisa | PESQUISANDO · rodada 44 — Imagens, pivô e Peles | `EXECUTANDO · rodada 44 — Imagens, pivô e Peles [c082dd]` (ref `c082dd`, conferido no `ListAgents` de 06/10/2026, 23h05; antes `7d3b96`, `89519c`, `RESERVA 36 · Recorte`) | rodada 44, parte 1: pesquisa e conferência das Imagens, do pivô e das Peles. rodada 44 **terminada**: v32.7, v32.8, v33.0, v33.3, v33.6, v34.0, v34.4 (doc `55`; provas finais conferidas nos docs `71` e `75`). Largou a máquina em 07/10, 00h04; portas 5510 e 9510 livres |
| Execução (fim) | EXECUTANDO · rodada 41 — o polimento da malha e dos pesos | `EXECUTANDO · rodada 41 — o polimento da malha e dos pesos [668a31]` (ref `668a31`, 06/10/2026, 17h29) | rodada 41 feita: v31.6, v31.9, v32.2, v32.4 (os 4 lotes do doc `43`). Largou a máquina; portas 5480/9480 livres |
| Pesquisa | PESQUISANDO · rodada 45 — Arquivo, exportar e importar | `PESQUISANDO · rodada 45 — Arquivo, exportar e importar [374550]` (ref `374550`, conferido em 06/10/2026, 17h33; antes `RESERVA 37 · Recorte`) | rodada 45, parte 1: pesquisa e conferência do Arquivo, exportar e importar. Escreve `57`. Portas 5520 (programa) e 9520 (Chrome sem janela). Sem código; espera o "pode" do Diretor |
| Pesquisa | PESQUISANDO · rodada 45 — Arquivo, exportar e importar | `PESQUISANDO · rodada 45 — Arquivo, exportar e importar [2e26fe]` (ref `2e26fe`, conferido no `ListAgents` de 06/10/2026, 18h29; o aplicativo reiniciou às 17h50 e o ref `374550` morreu) | rodada 45, parte 1 entregue (doc `57`). Portas 5520 e 9520. Sem código; espera o "pode" do Diretor |
| Reserva 38 | RESERVA 38 · Recorte | `RESERVA 38 · Recorte [d01269]` (ref `d01269`, conferido no `ListAgents` de 06/10/2026, 22h06) | chat de reserva. Sem ficha ainda; espera a ficha do `Diretor com monitoramento de chats [410edc]` por mensagem. Sem código |
| Pesquisa | PESQUISANDO · rodada 46 — Cena e ferramentas | `PESQUISANDO · rodada 46 — Cena e ferramentas [d01269]` (ref `d01269`, conferido no `ListAgents` de 06/10/2026, 22h31; antes `RESERVA 38 · Recorte`) | rodada 46, parte 1: pesquisa e conferência da Cena e das ferramentas. Escreve `66`. Portas 5530 (programa) e 9530 (Chrome sem janela). Sem código; espera o "pode" do Diretor |
| Execução | EXECUTANDO · rodada 46 — Cena e ferramentas | `EXECUTANDO · rodada 46 — Cena e ferramentas [d01269]` (ref `d01269`, conferido no `ListAgents` de 06/10/2026, 22h43; antes `PESQUISANDO · rodada 46` e `RESERVA 38`) | rodada 46, parte 2: os 5 lotes do doc `66`. **Escreve em `editor/`** (parte Cena). Portas 5530 e 9530. Reporta ao `Diretor com monitoramento de chats [410edc]` (ref vivo `3487d0`) |
| Executor da rodada 45 | EXECUTANDO · rodada 45 — Arquivo, exportar e importar | `EXECUTANDO · rodada 45 — Arquivo, exportar e importar [2e26fe]` (conferido em 06/10/2026, 23h51) | **largou a máquina às 23h51**: 5 lotes fechados (v33.1, v33.5, v33.7, v33.9, v34.3), doc `57`. Portas 5520 e 9520 soltas. O que falta é mão do Humberto (doc `57`, fim) |
| Pesquisa | PESQUISANDO · rodada 47 — o padrão dos painéis | `PESQUISANDO · rodada 47 — o padrão dos painéis [e1b767]` (ref `e1b767`, conferido no `ListAgents` de 07/10/2026, 03h01; antes `RESERVA 18 · Recorte`) | rodada 47, parte 1: a régua dos painéis e a varredura. Escreve `68`. Portas 5540 (programa) e 9540 (Chrome sem janela). Sem código; espera o "pode" do Diretor. A parte 2 só depois que a rodada 46 largar a máquina |
| Executor da rodada 45 | EXECUTANDO · rodada 45 — Arquivo, exportar e importar | `EXECUTANDO · rodada 45 — Arquivo, exportar e importar [2e26fe]` (07/10/2026, 03h20) | **largou a máquina às 03h20**, depois do lote 6 (v34.6). 6 lotes: v33.1, v33.5, v33.7, v33.9, v34.3, v34.6. Portas 5520 e 9520 soltas |
| Execução (fim) | EXECUTANDO · rodada 47 — o padrão dos painéis | `EXECUTANDO · rodada 47 — o padrão dos painéis [e1b767]` (ref `e1b767`, 07/10/2026, 08h34; antes `PESQUISANDO · rodada 47` e `RESERVA 18 · Recorte`) | rodada 47 **terminada**: v34.8, v34.9, v35.0, v35.1, v35.2, v35.3, v35.4 (doc `68`; prova final e o que ainda rola no fim dele). **Largou a máquina às 08h34**: nada em `editor/`, semáforo apagado, portas 5540 e 9540 livres |
| Execução (fim, de novo) | EXECUTANDO · rodada 47 — o padrão dos painéis | `EXECUTANDO · rodada 47 — o padrão dos painéis [e1b767]` (07/10/2026, 08h40) | depois do fim das 08h34, um lote 6b com as notas do doc 88: **v35.5**. **Largou a máquina de novo às 08h40**: nada em `editor/`, semáforo apagado, portas 5540 e 9540 livres. A mensagem final ao Diretor NÃO saiu (o aplicativo pausou o envio entre janelas até o Humberto escrever aqui): o relato está em ESTADO.md, CHANGELOG e no doc `68` |
| Execução (fim) | EXECUTANDO · rodada 47 — o padrão dos painéis | `EXECUTANDO · rodada 47 — o padrão dos painéis [e1b767]` (07/10/2026, 08h57) | depois da v35.5, um lote 6c com as notas do doc 90: **v35.6** (altura 83/90). **Largou a máquina às 08h57**: nada em `editor/`, semáforo apagado, portas 5540 e 9540 livres |
| Execução (fim) | EXECUTANDO · rodada 47 — o padrão dos painéis | `EXECUTANDO · rodada 47 — o padrão dos painéis [e1b767]` (07/10/2026, 09h10) | depois da v35.6, um lote 6d com o resto do detalhe do conferente (doc `92`, defeitos 3, 4 e 5): **v35.7**. Regras dobra; Prévia e evento dizem o que são. Altura 83/90. Portas 5540 e 9540 soltas |
| Execução | EXECUTANDO · rodada 48 — a mão do Humberto | `EXECUTANDO · rodada 48 — a mão do Humberto [e973b5]` (ref `e973b5`, conferido no `ListAgents` de 07/10/2026, 09h13; antes `RESERVA 17 · Recorte`) | rodada 48: o que a mão do Humberto achou (6 itens da ficha). **Escreve em `editor/`**. Portas 5550 (programa) e 9550 (Chrome sem janela). Reporta ao `Diretor com monitoramento de chats [410edc]` |
| Execução (fim) | EXECUTANDO · rodada 47 — o padrão dos painéis | `EXECUTANDO · rodada 47 — o padrão dos painéis [e1b767]` (07/10/2026, 09h19) | lote 6e (doc `92`, defeito 1): **v35.8**, a Ordem com 3 linhas em 720. **Largou a máquina às 09h19**: nada em `editor/`, semáforo apagado, portas 5540 e 9540 livres. As mensagens ao Diretor estão barradas pelo aplicativo até o Humberto escrever na janela: o relato está no ESTADO, no CHANGELOG e no doc `68` |
| Execução (fim) | EXECUTANDO · rodada 48 — a mão do Humberto | `EXECUTANDO · rodada 48 — a mão do Humberto [e973b5]` (07/10/2026, 09h39) | rodada 48 **terminada**: v35.9 (a cor das partículas, os avisos, o Texto do evento) e v36.0 (soltar a pasta abre a pasta; doc `89` anotado). **Largou a máquina**: nada em `editor/`, semáforo apagado, portas 5550 e 9550 livres |
| Execução (fim) | EXECUTANDO · rodada 48 — a mão do Humberto | `EXECUTANDO · rodada 48 — a mão do Humberto [e973b5]` (07/10/2026, 09h49) | depois da v36.0, um lote 3 com os pedidos do Diretor e do doc `95`: **v36.1** (a Ordem em 720 com linhas de 29 px; os avisos pelo tipo; o rodapé do exportar; o Sobre com a versão certa). **Largou a máquina**: nada em `editor/`, semáforo apagado, portas 5550 e 9550 livres |
| Conferência | CONFERINDO · rodada 49 — a mão pela janela | `CONFERINDO · rodada 49 — a mão pela janela [0abe3f]` (ref `0abe3f`, conferido no `ListAgents` de 07/10/2026, 13h01; antes `RESERVA 16 · Recorte`) | rodada 49: a mão pela janela, com o navegador do aplicativo (itens A a G do doc `89`). Sem código. Porta 5180 (o montado) ou 5560. Escreve `98`. Reporta ao `Diretor com monitoramento de chats [410edc]` |
| Conferência (fim) | CONFERINDO · rodada 49 — a mão pela janela | `CONFERINDO · rodada 49 — a mão pela janela [0abe3f]` (07/10/2026, 13h27) | rodada 49 **terminada**: doc `98`, 47 fotos em `backup/fotos-obra/rodada-49/`. Sem código. Servidor da porta 5180 desligado |
| Execução | EXECUTANDO · rodada 50 — o que a janela achou | `EXECUTANDO · rodada 50 — o que a janela achou [0abe3f]` (ref `0abe3f`, 07/10/2026, 13h29; antes `CONFERINDO · rodada 49` e `RESERVA 16 · Recorte`) | rodada 50: consertar o que o doc `98` achou, 4 lotes a partir da v36.2. **Escreve em `editor/`** (só ela). Portas 5560 (programa) e 9560 (Chrome sem janela). Semáforo `backup/FECHO-EM-CURSO.txt`. Reporta ao `Diretor com monitoramento de chats [410edc]` |
| Execução (fim) | EXECUTANDO · rodada 50 — o que a janela achou | `EXECUTANDO · rodada 50 — o que a janela achou [0abe3f]` (07/10/2026, 14h28) | rodada 50 **terminada**: v36.2, v36.3, v36.4, v36.5 (os 4 lotes do doc `98` e as notas dos docs `100` e `101`). **Largou a máquina**: nada em `editor/`, semáforo apagado, porta 5560 livre |
| Execução | EXECUTANDO · manual D13 para a v36.5 | `recorte-72 [69c996]` (nuvem, ramo `obra/manual`, 05/11/2026, 00h00; o `set_session_title` recusou o `self`, o título ficou sem mudar) | degrau D13: o manual para a v36.5. Fotos novas, a pausa dos testes do manual tirada, o PDF. Parte: `documentos/manual/`, os testes do manual, `ferramentas/manual-pdf.mjs` e `ferramentas/manual-fotos.mjs` |
