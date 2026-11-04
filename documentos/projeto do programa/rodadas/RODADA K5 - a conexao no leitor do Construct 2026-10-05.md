# Rodada K5 — a conexão no leitor do Construct

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Esta rodada escreve código só em `leitor-construct/`.** O chat que fez a K1 à K7 está arquivado; a pasta e o `LEIA-ME.md` dizem tudo.

---

## Onde a obra está

| | |
|:---|:---|
| O leitor | `leitor-construct/`: o `runtime/` inteiro num `.js`, o addon `saida/Recorte.c3addon` (SDK v2, mínimo r449), o exemplo `saida/heroi-andando.c3p`. K1 a K4, K6 e K7 feitas: tocar, malha, máscara, skin, partículas, a casca. **90 de 90 sobre o pacote**, remontado hoje às 11h10 com o runtime da v27.5 |
| O que mudou no runtime hoje | "Este boneco": o campo `around` no anexo `skeleton` (spec 7.11, 7.13, 7.7); `collectDrawGroups` e `collectDrawList` em `runtime/src/render-list.ts`; o relógio do filho continua na troca de placeholder com a mesma `uri`. **`collectDrawables` não mudou, de propósito:** o seu desenhador ainda o usa e desenha um arquivo com `around` **em bloco** |
| Os casos novos | 14 em `conformidade/casos-pendentes/` (C-263, C-310 a C-321, X-307), com `leiame.md` e a conta à mão. Passam nos dois runtimes |
| Nada do leitor foi visto dentro do Construct | é a mão do Humberto |

**Leia antes:** `CLAUDE.md` · `documentos/projeto do programa/08 OS LEITORES - Godot e Construct 2026-10-05.md` (seções 2, 4 e 5) · `02 AS DECISOES`, seção 2 inteira (a conexão, nas palavras do Humberto) · `leitor-construct/LEIA-ME.md`, `src/`, `testes/`, `montar.mjs` · a spec 7.11 a 7.13 · no fim do `03`: "um caso novo do Humberto: a mesma entidade duas vezes (as armas e as rodas)" e o achado 2 da G6 (o `reset` da física).

---

## O que tem de existir no fim

| # | | Régua |
|:---:|:---|:---|
| 1 | **O desenhador pela lista nova.** Troca `collectDrawables` pelos três grupos (`collectDrawGroups`): o que está atrás da marca · o boneco · o que está na frente. A máscara de quem recebe não corta a peça marcada; a do filho viaja com a peça | os 14 casos novos **pelo adaptador do pacote**; a lista do desenhador bate com a `drawList` do runtime, peça a peça, nos casos C-310 a C-319 |
| 2 | **Encaixar** `"motosserra.bone"` no slot `"mao"` · **Desencaixar** o slot · **Animar a peça** do slot (animação, em laço) · **Soltar a peça** (ninguém manda nela: fica livre para o jogo). Nomes em português, com as palavras do Humberto (`08`, seção 4) | por dentro, uma skin feita na hora, no topo da pilha, como o `08` propõe: nenhuma chave da animação a desfaz. A entidade cai no pino da imagem, com a ordem e as chaves dela. Desencaixar: a imagem de antes volta. Carregar a entidade de outro arquivo da pasta *Files* |
| 3 | **Encaixar em volta:** a ação de encaixar aceita, opcional, o slot do meio (o "Este boneco"). Sem ele, em bloco | um caso seu, com a lista à mão antes |
| 4 | **Encaixar todas** (o caso das rodas): troca todo slot que tem a entidade A pela B. E encaixar num slot só não mexe nos outros (o caso das duas armas iguais) | teste com dois slots com a mesma entidade |
| 5 | **O limite é do jogo:** expressões com a lista dos slots e das entidades carregadas; o gatilho **Ao encaixar**; `PecaDoSlot("mao")`. O leitor não recusa encaixe nenhum |
| 6 | **Um objeto do Construct seguindo um osso**: expressões `OssoX`, `OssoY`, `OssoAngulo` (e do slot), no espaço do layout, com o Y do Construct | conta à mão num osso girado e com escala |
| 7 | **O achado da G6:** o `Tocador` não solta a chave `reset` da física (o `applyResets` existe e ninguém chama). Regra 26: um teste que falha hoje (um boneco com `reset` fora do tempo 0), depois o conserto |
| 8 | **O jogo salvo** guarda os encaixes, como já guarda a pilha de skins |
| 9 | **O exemplo:** uma tecla troca a espada por outra peça e volta; outra liga uma peça "em volta". O `LEIA-ME.md` ganha as perguntas para o Humberto, **numa lista só, em ordem** |
| 10 | Peça que não existe, slot que não existe, animação que a peça não tem: **avisa** (a expressão Avisos e o console), e a peça fica parada. Nunca um palpite (regra 21) |

---

## As réguas

| # | |
|:---:|:---|
| 1 | **Só `leitor-construct/`.** Não toque `runtime/` (se precisar de algo de lá, **pare e me diga**: outro chat escreve em `editor/` e pode pedir mudança no runtime), `editor/`, `programa/`, `formato/`, `conformidade/`, `leitor-godot/` |
| 2 | Prove **no Node**, sem o Construct: o desenhador é função pura; o Tocador roda num editor de mentira, como a K7 fez. Diga às claras o que só a mão do Humberto prova |
| 3 | `npm run leitor:construct` e `npm run leitor:construct:conformidade` são leves: pode. **90 de 90 e os 14 novos sobre o pacote**, com a hora. Os testes de `leitor-construct/testes/`: pode. **Não** a suíte inteira da casa, roteiro, medição, montagem do `programa/` nem versão |
| 4 | **Regra 29, com força:** o teste `pacote.test.ts` compara o pacote do disco com o código. Outro chat vai fechar uma versão enquanto você trabalha. **Nunca deixe o pacote do disco diferente do código entre dois passos seus:** mexeu em `src/`, remonte na mesma volta |
| 5 | Regra 26 e regra 28 em cada peça. A forma de erro do dia, contada por outro chat: *"escolhi o estrago pelo nome do caso, não pelo que ele mexe"* |
| 6 | O construct.net pede verificação de robô: onde depender de uma página não lida, escreva a suposição no código e no relatório, com o link |
| 7 | Backup antes de escrever em arquivo que existe, com linha no `backup/INDICE.md` (CRLF): relógio primeiro, nome depois, no mesmo comando. Fim de linha conferido nos bytes, **sem `grep $'\r'` no Bash** (ele come a barra) |
| 8 | Memória: 0,5 GB livres ou mais antes de cada processo; um por vez |
| 9 | **Mensagem minha só chega quando o seu turno para.** Não pergunte nada ao Humberto; não abra painel de pergunta. Dúvida: a suposição escrita, siga, e me diga |

## O que entregar

Um aviso ao `DIRETOR · 000da3` por `SendMessage` (rode `ListAgents` antes): o que existe · os números sobre o pacote, com a hora · regra 26 e 28 · o que você supôs · o que não foi provado · o que só a mão do Humberto prova · o seu erro, pela forma. Uma linha sua no `03` ("O que cada rodada entregou"), relendo do disco antes de gravar (LF). Se ficar grande, **parta** (itens 1 a 5 · depois 6 a 10) e avise ao fechar a primeira parte. No fim, **pare**.
