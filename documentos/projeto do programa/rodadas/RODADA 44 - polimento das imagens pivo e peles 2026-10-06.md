# Rodada 44 — o polimento das Imagens, do pivô e das Peles

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 17h19.
**Parte 1: nenhum código.** Parte 2 só com o "pode" do Diretor. Reporta a `Diretor com monitoramento de chats [410edc]`.
**Portas suas:** programa 5510, Chrome sem janela 9510. Nenhuma outra. Nunca mate processo que não abriu.

**Leia antes:** `CLAUDE.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` (a ordem do Humberto e a régua do padrão) · `27`, `39`, `43` (**os moldes** de pesquisa e conferência) · `02 AS DECISOES` (a seção das peles e do pivô) · `editor/src/contract.ts` · `documentos/PARTES.md` (as partes Imagens `panels/palette*`, `image-picker*`, `image-grid-model.ts`, `pivot-*`; Peles `panels/skins*`, `skins-model.ts`, `skins-actions.ts`, `io/export-skin.ts`).

## O objetivo de usuário que prova a rodada

**Trocar a arma e fazer uma pele de inverno**: pelo botão direito trocar a espada por outra imagem da pasta, definir o pivô dela, e depois criar uma pele "inverno" que troca a roupa inteira, ativar e desativar, exportar e importar — só pela tela, como um usuário que não leu o código.

## Parte 1 — pesquisar e conferir (sem código)

| # | O que fazer |
|:---:|:---|
| 1 | **Como três programas fazem.** Spriter (Character Maps, pivô por imagem, pasta de imagens), Spine (Skins, Attachments, pivô/offset), DragonBones. Para cada um: como se troca a imagem de uma peça · como se define o pivô (clique? arrastar? número?) · como se cria uma pele, se ativa, se vê o que ela troca · exportar/importar pele · o que a tela mostra de unidade. **Com fonte** |
| 2 | **O que o nosso faz hoje.** No `programa/` montado (Chrome sem janela, 1920×1080): cada gesto da aba Imagens (pastas, miniaturas, Detalhes, arrastar para a cena, botão direito, a grade de troca, Trocar todas as iguais), do pivô (Definir pivô…, repetir para a pasta, o painel Pivôs, alinhar pelo PSD) e da aba Peles (Feitas/Ativas, criar, editar, Promover pele a base, Exportar e Importar pele). Diga por gesto: **faz · pela metade · não faz · não tem porta** |
| 3 | **O padrão.** Todo número (pivô X/Y, tamanho da miniatura, o que houver): unidade e faixa? Rótulo curto com frase na dica? A mesma densidade de texto nas duas abas? Liste o que falta, pela régua do `26` |
| 4 | **O caminho do objetivo.** Troque a arma e faça a pele de inverno. Anote cada passo e cada tropeço |
| 5 | **O plano dos lotes**, uma versão por lote, com o que tem de acontecer |

Entrega: `documentos/projeto do programa/55 AS IMAGENS O PIVO E AS PELES - pesquisa e conferencia 2026-10-06.md`, fotos em `backup/fotos-obra/rodada-44/`. Mande ao Diretor: o quadro em cinco linhas e o caminho do arquivo. **Pare e espere o "pode".**

## Parte 2 — construir (com o "pode")

Uma versão por lote. Escreve em `editor/`, nas partes Imagens e Peles. **Outras rodadas escrevem em `editor/` ao mesmo tempo**, em outras partes. Passagem (`contract.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `main.ts`): só acrescentando, relendo do disco antes de gravar.

## As réguas

| # | |
|:---:|:---|
| 1 | **O semáforo do fecho é um arquivo, e a checagem é uma PORTA.** Antes de CADA gravação em `editor/`, um comando que recusa se `backup/FECHO-EM-CURSO.txt` existir (`test -e … && exit 1`). Para fechar: "quero fechar" ao Diretor → PODE → crie o arquivo ("rodada 44, HH:MM") → meça → apague ao dizer "fechei a vN.N" |
| 2 | Toda função nova nasce com porta no menu e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, `ferramentas/provas/tarefas.ts`, `existir-nao-e-funcionar.test.ts`, `acoes.test.ts`. Tecla nova: uma linha em `ui/keys.ts` |
| 3 | Regra 26: o teste falha antes. Prove na tela com mouse. **Teste e função no mesmo golpe** (regra 29) |
| 4 | Lote sem foto não fecha: `backup/fotos-obra/rodada-44/`, 1920×1080 e 1280×720 |
| 5 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG · `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · contagem por arquivo. Único vermelho esperado: o antigo do manual. **A medição não cai** |
| 6 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/`. Peles e pivô já existem no formato: nada de campo novo |
| 7 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 8 | **Não pergunte nada ao Humberto; não abra painel de pergunta.** O que outro programa responde, decida pela pesquisa e escreva a suposição |
| 9 | Contexto pesado? Pare num lote fechado, com a passagem em `rodadas/` |

## O que entregar

A cada versão, `SendMessage` ao Diretor, **6 linhas**. No fim: **"larguei a máquina"**. Não escreva no `03`.
