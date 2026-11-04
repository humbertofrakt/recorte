# Rodada 41 — o polimento da malha e dos pesos

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 12h31.
**Parte 1: nenhum código.** Parte 2 só com o "pode" do Diretor. Reporta a `Diretor com monitoramento de chats [410edc]`.
**Portas suas:** programa 5480, Chrome sem janela 9480. Nenhuma outra. Nunca mate processo que não abriu.

**Leia antes:** `CLAUDE.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` (a ordem do Humberto e a régua do padrão) · `27 AS PARTICULAS - pesquisa e conferencia 2026-10-06.md` e `39 A LINHA DO TEMPO - pesquisa e conferencia 2026-10-06.md` (**os moldes**) · `02 AS DECISOES` · `editor/src/contract.ts` · `documentos/PARTES.md` (a parte Malha: `panels/mesh*`, `mesh-doc.ts`, `viewport/` só o que é de malha e pesos).

## O objetivo de usuário que prova a rodada

**Dobrar uma capa com pesos em dois ossos**: virar a imagem em malha, criar os vértices que faltam, ligar dois ossos, pintar os pesos, e ver a capa dobrar na animação — só pela tela, como um usuário que não leu o código.

## Parte 1 — pesquisar e conferir (sem código)

| # | O que fazer |
|:---:|:---|
| 1 | **Como três programas fazem.** Spine (mesh, weights, bind, pincel), DragonBones (mesh e weights), Spriter (deformação por pontos, se houver). Para cada um: como se cria a malha · como se cria e apaga vértice e aresta · como se ligam os ossos · como se pintam os pesos (pincel, raio, força, suavizar) · como se vê o peso de um vértice · o que a tela mostra de unidade. **Com fonte** |
| 2 | **O que o nosso faz hoje.** No `programa/` montado (Chrome sem janela, 1920×1080): cada gesto da aba Malha e pesos e da cena, com foto. Diga por gesto: **faz · pela metade · não faz · não tem porta**. Olhe em especial: Gerar malha, Criar vértice, Criar aresta, Usar a forma de outra malha, Ligar ossos, o Pincel (Somar, Subtrair, Substituir, Suavizar, Raio, Força), as pizzas, Chavear pesos, forma e pesos indo para a base |
| 3 | **O padrão.** Todo número da aba: unidade e faixa à vista ou na dica? Raio em px? Força de 0 a 1 ou %? Liste o que falta, pela régua do `26`. A aba Malha e pesos é das que **rolam** (não cabe em altura): diga o que rola e por quê |
| 4 | **O caminho do objetivo.** Dobre a capa. Anote cada passo e cada tropeço |
| 5 | **O plano dos lotes**, uma versão por lote, com o que tem de acontecer |

Entrega: `documentos/projeto do programa/43 A MALHA E OS PESOS - pesquisa e conferencia 2026-10-06.md`, fotos em `backup/fotos-obra/rodada-41/`. Mande ao Diretor: o quadro em cinco linhas e o caminho do arquivo. **Pare e espere o "pode".**

## Parte 2 — construir (com o "pode")

Uma versão por lote. Escreve em `editor/`, na parte Malha. **A rodada 40 escreve em `editor/` ao mesmo tempo**, na parte Linha do tempo. Passagem (`contract.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `main.ts`): só acrescentando, relendo do disco antes de gravar.

## As réguas

| # | |
|:---:|:---|
| 1 | **O semáforo do fecho é um arquivo.** Antes de CADA gravação em `editor/`, olhe `backup/FECHO-EM-CURSO.txt`; se existe, não grave. Para fechar: "quero fechar" ao Diretor → PODE → crie o arquivo ("rodada 41, HH:MM") → meça → apague ao dizer "fechei a vN.N" |
| 2 | Toda função nova nasce com porta no menu e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, `ferramentas/provas/tarefas.ts`, `existir-nao-e-funcionar.test.ts`, `acoes.test.ts`. Tecla nova: uma linha em `ui/keys.ts` |
| 3 | Regra 26: o teste falha antes. Prove na tela com mouse. **Tipo mudado e quem o usa, no mesmo golpe** |
| 4 | Lote sem foto não fecha: `backup/fotos-obra/rodada-41/`, 1920×1080 e 1280×720 |
| 5 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · `npm run pesos` · CHANGELOG · `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · contagem por arquivo. Único vermelho esperado: o antigo do manual |
| 6 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/`. Pesos e malha no `.bone` já existem no formato: nada de campo novo |
| 7 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 8 | **Não pergunte nada ao Humberto; não abra painel de pergunta.** O que outro programa responde, decida pela pesquisa e escreva a suposição |
| 9 | Contexto pesado? Pare num lote fechado, com a passagem em `rodadas/` |

## O que entregar

A cada versão, `SendMessage` ao Diretor, **6 linhas**: o número · o que o Humberto vai ver · os números do fecho com a hora · o que ficou de fora · o erro, pela forma. No fim: **"larguei a máquina"**. Não escreva no `03`.
