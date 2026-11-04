# Rodada 40 — o polimento da linha do tempo e das chaves

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 12h05.
**Parte 1: nenhum código.** Parte 2 só com o "pode" do Diretor. Reporta a `Diretor com monitoramento de chats [410edc]`.

**Leia antes:** `CLAUDE.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` (a ordem do Humberto e a régua do padrão) · `27 AS PARTICULAS - pesquisa e conferencia 2026-10-06.md` (**o molde**: a rodada 38 fez assim e deu certo) · `02 AS DECISOES` · `editor/src/contract.ts` · `documentos/PARTES.md` (a parte Linha do tempo: `panels/dopesheet*`, `panels/graph.ts`, `anim/timeline-tools.ts`, `anim/keying.ts`).

## O objetivo de usuário que prova a rodada

**Animar um andar de 1 s com curva de aceleração, copiar o membro para o outro lado espelhado, e empurrar as chaves para abrir espaço** — só pela tela, como um usuário que não leu o código.

## Parte 1 — pesquisar e conferir (sem código)

| # | O que fazer |
|:---:|:---|
| 1 | **Como três programas fazem.** Spriter (dopesheet, curvas por chave), Spine (dopesheet + graph editor), DragonBones. Para cada um: como se cria, move, copia e apaga chave · como se escolhe a curva (linear, stepped, bezier) e onde · como se vê o valor de uma chave · teclas · o que a tela mostra de unidade (s, quadros, %). **Com fonte**: página do manual em `documentos/pesquisa/`, ou link |
| 2 | **O que o nosso faz hoje.** No `programa/` montado (Chrome sem janela, 1920×1080; roteiros em `backup/fotos-obra/rodada-38/`): cada gesto da linha do tempo e do gráfico, com foto. Diga por gesto: **faz · pela metade · não faz · não tem porta**. Olhe em especial: a curva de uma chave (como se escolhe, se se vê), o valor da chave (número com unidade?), Ctrl+clique, Ctrl+arrastar, Shift, a chave de sequência, a linha da virada, Empurrar as chaves, Limpar repetidas, Colar espelhado |
| 3 | **O padrão.** Todo número da linha do tempo e da ficha de chave: unidade e faixa à vista ou na dica? Rótulo curto com frase na dica? Liste o que falta, pela régua do `26` |
| 4 | **O caminho do objetivo.** Faça o andar com curva, o espelho e o empurrão. Anote cada passo e cada tropeço |
| 5 | **O plano dos lotes**: o que falta, o que confunde, o que some; cada lote com o que tem de acontecer, uma versão por lote. Com as contas quando houver |

Entrega: `documentos/projeto do programa/39 A LINHA DO TEMPO - pesquisa e conferencia 2026-10-06.md`, fotos em `backup/fotos-obra/rodada-40/`. Mande ao Diretor: o quadro em cinco linhas e o caminho do arquivo. **Pare e espere o "pode".**

## Parte 2 — construir (com o "pode")

Uma versão por lote. Escreve em `editor/`, na parte Linha do tempo. **A rodada 39b escreve em `editor/` ao mesmo tempo**, na parte Entidades. Passagem (`contract.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `main.ts`): só acrescentando, relendo do disco antes de gravar.

## As réguas

| # | |
|:---:|:---|
| 1 | **O semáforo do fecho é um arquivo.** Antes de CADA gravação em `editor/`, olhe `backup/FECHO-EM-CURSO.txt`; se existe, não grave. Para fechar: "quero fechar" ao Diretor → PODE → crie o arquivo ("rodada 40, HH:MM") → meça → apague ao dizer "fechei a vN.N" |
| 2 | Toda função nova nasce com porta no menu e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, `ferramentas/provas/tarefas.ts`, `existir-nao-e-funcionar.test.ts`, `acoes.test.ts`. Tecla nova: uma linha em `ui/keys.ts` |
| 3 | Regra 26: o teste falha antes. Prove na tela com mouse. **Tipo mudado e quem o usa, no mesmo golpe**: a casa não pode ficar vermelha nem por 20 s |
| 4 | Lote sem foto não fecha: `backup/fotos-obra/rodada-40/`, 1920×1080 e 1280×720 |
| 5 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG · `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · contagem por arquivo. Único vermelho esperado: o antigo do manual |
| 6 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/` |
| 7 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 8 | **Não pergunte nada ao Humberto; não abra painel de pergunta.** O que outro programa responde, decida pela pesquisa e escreva a suposição |
| 9 | Contexto pesado? Pare num lote fechado, com a passagem em `rodadas/` |

## O que entregar

A cada versão, `SendMessage` ao Diretor, **6 linhas**: o número · o que o Humberto vai ver · os números do fecho com a hora · o que ficou de fora · o erro, pela forma. No fim: **"larguei a máquina"**. Não escreva no `03`.
