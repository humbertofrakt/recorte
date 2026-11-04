# Rodada 45 — o polimento do Arquivo, do exportar e do importar

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 17h30.
**Parte 1: nenhum código.** Parte 2 só com o "pode" do Diretor. Reporta a `Diretor com monitoramento de chats [410edc]`.
**Portas suas:** programa 5520, Chrome sem janela 9520. Nenhuma outra. Nunca mate processo que não abriu.

**Leia antes:** `CLAUDE.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` (a ordem do Humberto e a régua do padrão) · `27`, `39`, `43`, `51` (**os moldes**) · `02 AS DECISOES` (a seção "Começar" e o projeto em pasta) · `editor/src/contract.ts` · `documentos/PARTES.md` (a parte Arquivo: `shell-file.ts`, `io/open-save.ts`, `io/folder-save.ts`, `io/project-open.ts`, `io/save-binary.ts`, `drop-plan.ts`, `export-image.ts`, `export-gltf.ts`, `ferramentas/src/importar/spriter.ts`).

## O objetivo de usuário que prova a rodada

**Salvar, reabrir, exportar imagem e pacote**: começar um projeto numa pasta, salvar, fechar e reabrir no mesmo lugar; exportar uma imagem da pose com borda automática e um pacote `.bonez`; importar um projeto do Spriter — só pela tela, como um usuário que não leu o código.

## Parte 1 — pesquisar e conferir (sem código)

| # | O que fazer |
|:---:|:---|
| 1 | **Como três programas fazem.** Spriter (projeto em pasta, Save/Save As, Export to PNG/GIF, autosave), Spine (Export: JSON/binary, images, atlas; Import), DragonBones; e o **Photoshop** para Salvar/Salvar como/Exportar como. Para cada um: o que "Novo", "Abrir", "Salvar" e "Salvar como" fazem · o que a janela de exportar pergunta e em que unidade · recuperação de rascunho · o que a tela diz quando falha. **Com fonte** |
| 2 | **O que o nosso faz hoje.** No `programa/` montado (Chrome sem janela, 1920×1080): cada item do menu Arquivo e cada caminho (Novo projeto…, Abrir pasta…, Abrir, Salvar, Salvar como pacote, Entregar um corpo, Exportar imagem, Exportar glTF, Importar do Spriter, recuperar rascunho, arrastar um `.bone` ou uma pasta para a janela). Diga por gesto: **faz · pela metade · não faz · não tem porta**. Confira o achado da rodada 39: Salvar com problemas no arquivo avisa em português? O `.bone` muda de tamanho entre dois Salvar sem edição (o `RECORTE_editor_state`): é esperado; diga só se a tela avisa |
| 3 | **O padrão.** Toda janela de diálogo (Exportar imagem, pacote, Spriter): números com unidade e faixa? Rótulo curto com frase na dica? Botões com o nome? O que só a mão do Humberto prova (o seletor de pasta do Windows), **diga às claras** |
| 4 | **O caminho do objetivo.** Faça o objetivo inteiro. Anote cada passo e cada tropeço |
| 5 | **O plano dos lotes**, uma versão por lote, com o que tem de acontecer |

Entrega: `documentos/projeto do programa/57 O ARQUIVO - pesquisa e conferencia 2026-10-06.md`, fotos em `backup/fotos-obra/rodada-45/`. Mande ao Diretor: o quadro em cinco linhas e o caminho do arquivo. **Pare e espere o "pode".**

## Parte 2 — construir (com o "pode")

Uma versão por lote. Escreve em `editor/`, na parte Arquivo (e em `ferramentas/src/importar/` se o Spriter pedir). **Outras rodadas escrevem em `editor/` ao mesmo tempo**, em outras partes. Passagem (`contract.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `main.ts`): só acrescentando, relendo do disco antes de gravar.

## As réguas

| # | |
|:---:|:---|
| 1 | **O semáforo do fecho é um arquivo, e a checagem é uma PORTA.** Antes de CADA gravação em `editor/`, um comando que recusa se `backup/FECHO-EM-CURSO.txt` existir (`test -e … && exit 1`). Para fechar: "quero fechar" ao Diretor → PODE → crie o arquivo ("rodada 45, HH:MM") → meça → apague ao dizer "fechei a vN.N" |
| 2 | Toda função nova nasce com porta no menu e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, `ferramentas/provas/tarefas.ts`, `existir-nao-e-funcionar.test.ts`, `acoes.test.ts`. Tecla nova: uma linha em `ui/keys.ts` |
| 3 | Regra 26: o teste falha antes. Prove na tela com mouse. **Teste e função no mesmo golpe** (regra 29) |
| 4 | Lote sem foto não fecha: `backup/fotos-obra/rodada-45/`, 1920×1080 e 1280×720 |
| 5 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG · `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · contagem por arquivo. Único vermelho esperado: o antigo do manual. **A medição não cai** |
| 6 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/`. **Nada de campo novo no `.bone`**: o que é do editor vai em `RECORTE_editor_state` ou no `manifest.json` |
| 7 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 8 | **Não pergunte nada ao Humberto; não abra painel de pergunta.** O que outro programa responde, decida pela pesquisa e escreva a suposição |
| 9 | Contexto pesado? Pare num lote fechado, com a passagem em `rodadas/` |

## O que entregar

A cada versão, `SendMessage` ao Diretor, **6 linhas**. No fim: **"larguei a máquina"**. Não escreva no `03`.
