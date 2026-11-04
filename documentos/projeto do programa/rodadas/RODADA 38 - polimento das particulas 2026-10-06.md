# Rodada 38 — o polimento das partículas

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 07h35.
**Parte 1: nenhum código.** Parte 2 só com o "pode" do Diretor. Reporta a `Diretor com monitoramento de chats [410edc]`.

**Leia antes:** `CLAUDE.md` · `documentos/projeto do programa/26 O POLIMENTO - parte por parte 2026-10-06.md` (a ordem do Humberto e a régua do padrão) · `16 AS PARTICULAS - o plano 2026-10-05.md` · `18` e `19 AS PARTICULAS CONFERIDAS` · `editor/src/contract.ts` · `documentos/PARTES.md`.

## As palavras do Humberto

> *"Vi os exemplos (fogo, fumaça, faísca) mas não sei como usar."*
> *"As partículas têm várias formas de emissor, mas quando mudo não vi como controlar cada um conforme a forma: a linha gera na linha, mas o círculo e o quadrado não sei o que fazem."*
> *"Em algum menu tinha uma caixa com (0.5): não entendi se é de 0 a 1 ou o quê."*
> *"Se eu quero fazer uma fumaça, espero que tenha os menus para fazer a partícula e manipular até ficar como uma fumaça."*

## Parte 1 — pesquisar e conferir (sem código)

| # | O que fazer |
|:---:|:---|
| 1 | **Como três programas fazem.** Spine (particles não tem: diga isso), Godot `CPUParticles2D`/`GPUParticles2D`, Unity Particle System, Construct 3 Particles, e o Spriter se tiver. Para cada um: as **formas de emissor** e o que cada forma controla (raio, largura, só borda ou cheio, direção) · como se chega a fogo, fumaça e faísca (os valores) · como os campos mostram unidade e faixa. **Com fonte**: link ou página do manual, nunca de memória. Manuais em `documentos/pesquisa/`; o que não houver, busque na web |
| 2 | **O que o nosso faz hoje.** No `programa/` montado (Chrome sem janela, 1920×1080; roteiros em `backup/fotos-obra/rodada-16/`): abra a ficha do emissor, troque **cada forma** (ponto, linha, círculo, quadrado, caminho, o que houver) e fotografe o que muda na cena e no painel. Diga, por forma: **o que ela faz · o que controla · o que o usuário NÃO tem como controlar**. Ache a caixa do `0.5` e diga o que é |
| 3 | **Os exemplos.** Onde estão fogo, fumaça e faísca, como se põem na cena, e o que acontece depois. Se não há porta de clique, diga |
| 4 | **O caminho do objetivo.** Tente fazer **uma fumaça do zero**, só pelo programa, como um usuário que não leu o código. Anote cada passo e cada tropeço. O mesmo para fogo e faísca |
| 5 | **O plano dos lotes**, pela régua do padrão do `26`: o que falta, o que confunde, o que some, lote a lote, cada lote com o que tem de acontecer (não o gesto). Com as contas: se um campo vira faixa, qual, e por quê |

Entrega: `documentos/projeto do programa/27 AS PARTICULAS - pesquisa e conferencia 2026-10-06.md`, fotos em `backup/fotos-obra/rodada-38/`. Mande ao Diretor por `SendMessage`: o quadro em cinco linhas e o caminho do arquivo. **Pare e espere o "pode".**

## Parte 2 — construir (com o "pode")

Uma versão por lote. Escreve em `editor/`; é a única que escreve ali enquanto roda. Se precisar de `formato/` ou `runtime/`, **pare e me diga**: o modelo muda.

## As réguas

| # | |
|:---:|:---|
| 1 | Toda função nova nasce com porta no menu, e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, nome em `ferramentas/provas/tarefas.ts`, estado em `existir-nao-e-funcionar.test.ts` e `acoes.test.ts` |
| 2 | Regra 26: o teste falha antes. Prove na tela com mouse, no editor do disco |
| 3 | Lote sem foto não fecha: `backup/fotos-obra/rodada-38/`, 1920×1080 e 1280×720 |
| 4 | Fecho de cada lote, um processo por vez: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG · o quadro do `ESTADO.md` · `python ferramentas/montar-programa.py <número>` · `python ferramentas/versao.py <número> "…"` · a contagem por arquivo. O único vermelho esperado é o antigo do manual: não conserte |
| 5 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/` |
| 6 | Backup antes de escrever, linha no `backup/INDICE.md` (CRLF). Relógio primeiro |
| 7 | **Não pergunte nada ao Humberto; não abra painel de pergunta.** O que outro programa responde, decida pela pesquisa e escreva a suposição. Só sobe o que nenhum programa responde |
| 8 | Contexto pesado? Pare num lote fechado, com a passagem |

## O que entregar

A cada versão, `SendMessage` ao Diretor: o número · o que o Humberto vai ver, em três linhas · os números do fecho com a hora · o que ficou de fora · o seu erro, pela forma. No fim: **"larguei a máquina"**. Não escreva no `03`.

## Acréscimo do Humberto, 06/10, 08h01

*"Não sei dizer se já é assim, mas as partículas devem aparecer na ordem de desenho."*

Entra na parte 1, item 2: confira se o emissor **aparece na aba Ordem** como qualquer peça, e se arrastá-lo ali o põe na frente ou atrás das imagens. Diga: já faz · pela metade · não faz. Se não faz, é um lote da parte 2. Como fazem os outros: o Godot e o Unity dão ao emissor um z/sorting como a qualquer nó; o Construct o trata como objeto na camada. Siga isso.
