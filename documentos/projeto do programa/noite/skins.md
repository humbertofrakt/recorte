# Relatório — Skins (ramo `obra/skins`)

Noite de 04 para 05/11/2026. Executor das Skins.
Para o Humberto. Frases curtas.

## Em uma linha

**Agora as skins têm tela.** Uma janela nova, o **Guarda-roupa**: cada coluna é uma skin, cada linha um desenho. Clica, troca.

## Antes e depois — a mesma pessoa nova, só clicando

| # | Objetivo | Antes | Depois |
|:-:|:---|:-:|:-:|
| a | Roupa nova "ferro", trocando 3 desenhos | meio (só pela Árvore → Propriedades) | **sim** |
| b | Ver as roupas lado a lado, e alternar | **não** | **sim** |
| c | Juntar armadura + capa | sim | **sim** |
| d | Mandar a roupa para outro boneco | sim | **sim** |
| e | Skin de fora com capacete (e a imagem dele) | **não** (cabeça sumia) | **sim** |

Prova: `node ferramentas/provas/skins-pessoa.mjs` → **5 de 5 objetivos feitos só com cliques visíveis.**
Medido às 00:57 UTC de 05/11.

## O que mudou na tela

| Onde | O que |
|:---|:---|
| Menu **Skins** | Primeiro item: **Guarda-roupa: desenho × skin…** |
| Aba **Skins** | Botão com texto **Guarda-roupa: desenho × skin…** |
| Aba **Skins** | Linha nova: *"Vestida: armadura · Lápis: base"* — diz o estado |
| Aba **Skins** | "Feitas" → **Todas**; "Ativas" → **Vestidas** |
| Aba **Skins** | Mouse em cima de uma skin em **Todas**: a cena **prova** a roupa |
| Guarda-roupa | O boneco inteiro no topo de cada coluna: lado a lado |
| Guarda-roupa | Manequim grande à esquerda: mouse na coluna = **Provando** |
| Guarda-roupa | **Vestir só esta** · **por cima** · **+ Cópia** · **Levar…** |
| Guarda-roupa | Clique na casa: *"Trocar body na skin ferro"* — diz o desenho **e** a skin |
| Guarda-roupa | **Igual à base** · **Esconder** |
| Guarda-roupa | **+ Nova skin** · **Trazer skin de fora…** |
| Trazer skin | O `.bone` e a imagem escolhidos juntos: a imagem **entra junto** |

## Defeitos achados e consertados

| # | Defeito (pela forma) | Conserto |
|:-:|:---|:---|
| 1 | A frase da skin vazia mandava **criar** desenho, e a pessoa queria **trocar** | A frase aponta o Guarda-roupa |
| 2 | A imagem escolhida junto com a skin de fora ficava no arquivo aberto e não entrava na cena | Vira imagem solta (aba Imagens; o Salvar grava) e ganha região |
| 3 | A janela do nome abria **atrás** do Guarda-roupa | Guarda-roupa fica embaixo das perguntas |
| 4 | O nome proposto vinha sem seleção: "skinferro" | Vem selecionado |
| 5 | Depois de marcar **por cima**, a prova do mouse escondia o que se pediu | A prova pausa até o mouse sair |
| 6 | Depois de trocar, a grade rolava e o nome das colunas sumia | A linha dos nomes não rola |

Os defeitos 3 a 6 **só a prova de pessoa achou.** Os testes puros passavam.

## Palavras (decidido sozinho)

| Na tela | Por quê |
|:---|:---|
| **skin** | Você usa. O menu já é Skins. A dica diz "uma roupa" |
| **desenho** | O dicionário da casa (`ui/jargao.ts`) chama o slot assim. Eu tinha posto "peça"; troquei |
| **Guarda-roupa** | A janela. Nome de casa |
| **vestida / guardada** | Era ativa / inativa |
| **base** | A skin `default` |

## O formato

Não mudou. Nenhum campo novo (regra 7). Toda troca é um passo do **Ctrl+Z**.

## A régua

| Medida | Resultado | Hora (UTC) |
|:---|:---|:---|
| `npx vitest run` | 5.909 passam, 1 vermelho, 31 pulados (5.941) | 01:00 |
| o vermelho | `ajuda.test.ts` — as imagens do manual. **O conhecido.** Não é meu | 01:00 |
| testes novos meus | 14, em `peles.test.ts` | — |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo | 00:57 |
| `node ferramentas/conformidade.mjs` | 132 de 132 | 01:00 |
| prova de pessoa | 5 de 5 | 00:57 |

Não rodei `npm run roteiro` nem `npm run medir`: usam as portas 5191 e 9335, proibidas nesta noite.
A régua dos painéis (`paineis.test.ts`) passa.

## Arquivos

| Arquivo | O que |
|:---|:---|
| `editor/src/panels/skins-wardrobe-model.ts` | **novo.** As contas da grade (puro) |
| `editor/src/panels/skins-wardrobe.ts` | **novo.** A janela |
| `editor/src/panels/skins.ts` | botão, linha de estado, Todas/Vestidas, prova pelo mouse |
| `editor/src/panels/skins-actions.ts` | ação `guarda-roupa`; a imagem que vem junto; frases |
| `editor/src/panels/skins.css` | o desenho da janela |
| `editor/src/ui/menus.ts`, `ui/actions-table.ts` | **só acrescentei** o item e o id |
| `editor/testes/peles.test.ts` | 14 testes |
| `editor/testes/acoes.test.ts` | contagem: 309 e 132 (+1 cada) |
| `ferramentas/provas/tarefas.ts` | a tarefa do Guarda-roupa |
| `ferramentas/provas/skins-pessoa.mjs` | **novo.** A prova de pessoa |
| `documentos/projeto do programa/noite/skins-o-desenho.md` | diagnóstico, pesquisa, desenho |
| `documentos/projeto do programa/noite/skins-como-fazer.md` | **Como fazer**, uma ação por linha |
| `documentos/projeto do programa/noite/fotos-skins/` | 3 fotos antes, 4 depois |

## O que ficou de fora (não é da minha parte — para o Diretor)

| # | O que | De quem |
|:-:|:---|:---|
| 1 | A lista de imagens da **Propriedades** diz *"Trocar a imagem de body"* sem dizer **em que skin** | `image-picker.ts` (painéis/imagens) |
| 2 | Na Árvore, osso e desenho têm o mesmo nome (`hair`, `arm`): clicar pega o osso | Árvore |
| 3 | O desenho com várias imagens (mão aberta/fechada) aparece no Guarda-roupa só pela de partida | decisão minha; as outras seguem pela Propriedades |
| 4 | Uma skin de fora com caminho de pasta (`elmos/capacete`) casa pelo fim do nome | anotado no código |

## Commits (ramo `obra/skins`)

| Commit | O quê |
|:---|:---|
| `3d52fe9` | diagnóstico e desenho |
| `2bdadea` | o Guarda-roupa |
| `f04f5fd` | a skin de fora traz a imagem |
| `6f2ff4d` | prova de pessoa, fotos, Como fazer |
| `22fb71d` | mouse na aba prova na cena |
| `4b6f47a` | junta o ramo da noite; "peça" → "desenho" |
| `726010f` | nome das colunas não rola |

FIM
