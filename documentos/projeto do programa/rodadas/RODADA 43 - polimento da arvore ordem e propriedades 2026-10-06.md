# Rodada 43 — o polimento da Árvore, da Ordem e das Propriedades

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 13h47.
**Parte 1: nenhum código.** Parte 2 só com o "pode" do Diretor. Reporta a `Diretor com monitoramento de chats [410edc]`.
**Portas suas:** programa 5500, Chrome sem janela 9500. Nenhuma outra. Nunca mate processo que não abriu.

**Leia antes:** `CLAUDE.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` (a ordem do Humberto e a régua do padrão) · `27`, `39` e `43` (**os moldes** de pesquisa e conferência) · `02 AS DECISOES` · `editor/src/contract.ts` · `documentos/PARTES.md` (as partes Árvore `panels/tree*`, `tree-actions.ts`; Ordem `panels/draw-order*`, `draw-order-model.ts`; Ficha `panels/properties*`, `properties-model.ts`).

## O objetivo de usuário que prova a rodada

**Achar, renomear e ordenar 30 peças sem se perder**: num boneco com 30 imagens e 15 ossos, achar uma peça pelo nome, renomeá-la, mudar o pai dela, pô-la na frente de outra, e ler na ficha onde ela está e quanto gira — só pela tela, como um usuário que não leu o código.

## Parte 1 — pesquisar e conferir (sem código)

| # | O que fazer |
|:---:|:---|
| 1 | **Como três programas fazem.** Spine (Tree, Draw Order, Properties), Spriter (Hierarchy, Z-order, Object Properties), DragonBones, e o **Photoshop** para a lista de camadas (busca, grupos, dobrar, arrastar, cores). Para cada um: busca · renomear (duplo clique? F2?) · arrastar para trocar o pai · ordem de desenho (arrastar, teclas) · o que a ficha mostra (unidade, passo, arrastar o número) · dicas. **Com fonte** |
| 2 | **O que o nosso faz hoje.** No `programa/` montado (Chrome sem janela, 1920×1080): cada gesto da Árvore, da Ordem e das Propriedades, com foto. Diga por gesto: **faz · pela metade · não faz · não tem porta**. Olhe em especial: busca, dobrar, renomear, arrastar para o pai, trocar de lugar, o P segurado, Ctrl+setas na Ordem, a ficha de osso/imagem/slot/malha/emissor, o Delete (hoje diz só "Apagar." — recado da rodada 41) |
| 3 | **O padrão.** Todo número da ficha: unidade (px, °, ×, %) e faixa à vista ou na dica? Passo de arrasto? A **ficha rápida** sem °/px/× (recado da rodada 40). Rótulo curto com frase na dica? A mesma densidade de texto nas três abas? Liste o que falta, pela régua do `26` |
| 4 | **O caminho do objetivo.** Faça o objetivo com um boneco grande (monte um a partir do herói duplicando peças, ou use o de mais peças que houver). Anote cada passo e cada tropeço |
| 5 | **O plano dos lotes**, uma versão por lote, com o que tem de acontecer |

Entrega: `documentos/projeto do programa/51 A ARVORE A ORDEM E AS PROPRIEDADES - pesquisa e conferencia 2026-10-06.md`, fotos em `backup/fotos-obra/rodada-43/`. Mande ao Diretor: o quadro em cinco linhas e o caminho do arquivo. **Pare e espere o "pode".**

## Parte 2 — construir (com o "pode")

Uma versão por lote. Escreve em `editor/`, nas partes Árvore, Ordem e Ficha. **Outras rodadas escrevem em `editor/` ao mesmo tempo**, em outras partes. Passagem (`contract.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `main.ts`): só acrescentando, relendo do disco antes de gravar.

## As réguas

| # | |
|:---:|:---|
| 1 | **O semáforo do fecho é um arquivo, e a checagem é uma PORTA.** Antes de CADA gravação em `editor/`, um comando que recusa se `backup/FECHO-EM-CURSO.txt` existir (`test -e … && exit 1`). Para fechar: "quero fechar" ao Diretor → PODE → crie o arquivo ("rodada 43, HH:MM") → meça → apague ao dizer "fechei a vN.N" |
| 2 | Toda função nova nasce com porta no menu e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, `ferramentas/provas/tarefas.ts`, `existir-nao-e-funcionar.test.ts`, `acoes.test.ts`. Tecla nova: uma linha em `ui/keys.ts` |
| 3 | Regra 26: o teste falha antes. Prove na tela com mouse. **Teste e função no mesmo golpe** (regra 29): a casa não fica vermelha nem 20 s |
| 4 | Lote sem foto não fecha: `backup/fotos-obra/rodada-43/`, 1920×1080 e 1280×720 |
| 5 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG · `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · contagem por arquivo. Único vermelho esperado: o antigo do manual. **A medição não cai** |
| 6 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/` |
| 7 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 8 | **Não pergunte nada ao Humberto; não abra painel de pergunta.** O que outro programa responde, decida pela pesquisa e escreva a suposição |
| 9 | Contexto pesado? Pare num lote fechado, com a passagem em `rodadas/` |

## O que entregar

A cada versão, `SendMessage` ao Diretor, **6 linhas**. No fim: **"larguei a máquina"**. Não escreva no `03`.
