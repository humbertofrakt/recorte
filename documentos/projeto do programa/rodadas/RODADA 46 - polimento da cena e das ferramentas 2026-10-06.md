# Rodada 46 — o polimento da Cena e das ferramentas

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 22h02.
**Parte 1: nenhum código.** Parte 2 só com o "pode" do Diretor. Reporta a `Diretor com monitoramento de chats [410edc]`.
**Portas suas:** programa 5530, Chrome sem janela 9530. Nenhuma outra. Nunca mate processo que não abriu.

**Leia antes:** `CLAUDE.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` (a ordem do Humberto e a régua do padrão) · `27`, `39`, `43`, `51`, `55`, `57` (**os moldes**) · `02 AS DECISOES` · `editor/src/contract.ts` · `documentos/PARTES.md` (a parte Cena: `viewport/` inteiro — `viewport.ts`, `viewport-draw.ts`, `picking.ts`, `onion.ts`, as ferramentas Transformar, Mover, Girar, Escalar, Inclinar, Selecionar, Criar osso, Ponto, Caixa; `commands/create-bone.ts`, `commands/reparent.ts`).

## O objetivo de usuário que prova a rodada

**Posar o herói com o Transformar**: escolher um osso na cena, mover, girar pela bolinha, escalar pelo quadradinho, inclinar com Alt no meio do lado; criar um osso novo com B pegando dois desenhos; pendurar uma peça com P; criar um ponto e uma caixa — só pela tela, como um usuário que não leu o código, lendo o rodapé para saber o que cada ferramenta faz.

## Parte 1 — pesquisar e conferir (sem código)

| # | O que fazer |
|:---:|:---|
| 1 | **Como três programas fazem.** Spine (Transform tools, Pose/Weights, a caixa de seleção, as alças), Spriter (a caixa de transformação, os atalhos, o pivô na cena), DragonBones. Para cada um: as alças (quantas, onde, o que fazem) · o que o cursor mostra · o rodapé ou a barra de estado durante o gesto · snap e modificadores (Shift, Alt, Ctrl) · o clique passa pelo transparente? · zoom e pan. **Com fonte** |
| 2 | **O que o nosso faz hoje.** No `programa/` montado (Chrome sem janela, 1920×1080): cada ferramenta da barra e cada alça, com foto; o que o rodapé diz ao passar o mouse e ao arrastar; as teclas (B, P, Y, N, Espaço, Ctrl+setas, Alt); o zoom e o pan; a cebola; a grade e a régua. Diga por gesto: **faz · pela metade · não faz · não tem porta** |
| 3 | **O padrão.** Toda ferramenta tem nome na dica e frase no rodapé? Os números da cena (zoom %, posição do mouse em px, ângulo durante o giro) aparecem com unidade? Liste o que falta, pela régua do `26` |
| 4 | **O caminho do objetivo.** Pose o herói. Anote cada passo e cada tropeço |
| 5 | **O plano dos lotes**, uma versão por lote, com o que tem de acontecer |

Entrega: `documentos/projeto do programa/66 A CENA E AS FERRAMENTAS - pesquisa e conferencia 2026-10-06.md`, fotos em `backup/fotos-obra/rodada-46/`. Mande ao Diretor: o quadro em cinco linhas e o caminho do arquivo. **Pare e espere o "pode".**

## Parte 2 — construir (com o "pode")

Uma versão por lote. Escreve em `editor/`, na parte Cena. **Outras rodadas escrevem em `editor/` ao mesmo tempo**, em outras partes; `viewport-draw.ts` e `viewport.ts` receberam linhas das rodadas 39 e 41 (as peças de teste e o redesenho do hover): releia do disco antes de gravar. Passagem (`contract.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `main.ts`): só acrescentando.

## As réguas

| # | |
|:---:|:---|
| 1 | **O semáforo do fecho é um arquivo, e a checagem é uma PORTA.** Antes de CADA gravação em `editor/`, um comando que recusa se `backup/FECHO-EM-CURSO.txt` existir (`test -e … && exit 1`). Para fechar: "quero fechar" ao Diretor → PODE → crie o arquivo ("rodada 46, HH:MM") → meça → apague ao dizer "fechei a vN.N" |
| 2 | Toda função nova nasce com porta no menu e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, `ferramentas/provas/tarefas.ts`, `existir-nao-e-funcionar.test.ts`, `acoes.test.ts`. Tecla nova: uma linha em `ui/keys.ts` |
| 3 | Regra 26: o teste falha antes. Prove na tela com mouse. **Teste e função no mesmo golpe** (regra 29): a casa não fica vermelha nem 20 s |
| 4 | Lote sem foto não fecha: `backup/fotos-obra/rodada-46/`, 1920×1080 e 1280×720 |
| 5 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG · `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · contagem por arquivo. Único vermelho esperado: o antigo do manual. **A medição não cai** |
| 6 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/` |
| 7 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 8 | **Não pergunte nada ao Humberto; não abra painel de pergunta.** O que outro programa responde, decida pela pesquisa e escreva a suposição |
| 9 | Contexto pesado? Pare num lote fechado, com a passagem em `rodadas/` |

## O que entregar

A cada versão, `SendMessage` ao Diretor, **6 linhas**. No fim: **"larguei a máquina"**. Não escreva no `03`.
