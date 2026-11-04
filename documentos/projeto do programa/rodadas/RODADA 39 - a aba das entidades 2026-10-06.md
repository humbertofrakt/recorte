# Rodada 39 — a aba das entidades, do plano ao programa

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 07h47.
**Escreve código em `editor/`.** Enquanto roda, é a única que escreve ali e fecha versão. Reporta a `Diretor com monitoramento de chats [410edc]`.

**Leia antes:** `CLAUDE.md` · `documentos/projeto do programa/22 A ABA DAS ENTIDADES - o plano 2026-10-05.md` (**inteiro**: é o seu plano) · `26 O POLIMENTO - parte por parte 2026-10-06.md` (a régua do padrão) · `02 AS DECISOES` seção 2 · `editor/src/contract.ts` · `documentos/PARTES.md`.

## As decisões

As sete perguntas da seção 10 do plano `22` **estão decididas**: vale a coluna da sugestão, linha por linha. Palavra do Humberto, 06/10: *"todas as suas perguntas provavelmente já têm respostas em outros programas."* Nada sobe para ele.

## O que fazer

Os **sete lotes da seção 9 do plano**, na ordem, **uma versão por lote**. O lote 1 só mostra; o teste vem no 2.

| # | Antes de cada lote |
|:---:|:---|
| 1 | Releia a seção do plano daquele lote e a coluna "o que pode quebrar" |
| 2 | Lote 2 pode pedir `contract.ts`: leia inteiro antes; se precisar de comando novo do projeto, escreva a regra no `contract.ts` e me diga no relatório |
| 3 | A régua do padrão do `26` vale para todo campo e botão que nascer: unidade e faixa à vista ou na dica, rótulo curto, frase inteira na dica. "Na cena" no lugar de "Aparecer na linha do tempo" |

## As réguas

| # | |
|:---:|:---|
| 1 | Toda função nova nasce com porta no menu, e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, nome em `ferramentas/provas/tarefas.ts`, estado em `existir-nao-e-funcionar.test.ts` e `acoes.test.ts` |
| 2 | Regra 26: o teste falha antes. Prove na tela com mouse, no editor do disco, Chrome sem janela (roteiros em `backup/fotos-obra/rodada-23/roteiros/`) |
| 3 | Lote sem foto não fecha: `backup/fotos-obra/rodada-39/`, 1920×1080 e 1280×720 |
| 4 | Fecho de cada lote, um processo por vez: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG · o quadro do `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · a contagem por arquivo. Único vermelho esperado: o antigo do manual, não conserte |
| 5 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/`. **Nada muda no formato**: o teste mora no `manifest.json` |
| 6 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 7 | **Não pergunte nada ao Humberto; não abra painel de pergunta.** Dúvida: suposição escrita, siga, e me diga |
| 8 | Contexto pesado? Pare num lote fechado, com a passagem, e me diga o número do lote |

## O que entregar

A cada versão, `SendMessage` ao Diretor: o número · o que o Humberto vai ver, em três linhas · os números do fecho com a hora · o que ficou de fora · o seu erro, pela forma. No fim dos sete: **"larguei a máquina"**. Não escreva no `03`.
