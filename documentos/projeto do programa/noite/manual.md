# Manual — relatório da noite (degrau D13)

Ramo: `obra/manual`. Partiu de `obra/manual` e juntou `obra/noite-2026-11-04`
(7c21fe0) por `git merge`. Medido às 01h00 UTC de 05/11/2026.

## O que fiz

| O que fiz | Como provei | O que ficou |
|:---|:---|:---|
| Tirei a pausa dos testes do manual | antes: 13 vermelhos com a pausa desligada. Depois: verdes | nada |
| Fotos novas, todas do programa de verdade | `node ferramentas/manual-fotos.mjs`: abre o editor, clica, fotografa. 1440×900 | nada |
| Apaguei as fotos velhas | teste "toda imagem no disco é citada": era vermelho, ficou verde | nada |
| Conferi os caminhos de menu | um script leu 312 caminhos `Menu → item` do manual e comparou com os menus do código | 6 avisos que não são caminho (linhas de história, botão de painel) |
| Escrevi os itens que faltavam | teste "o manual cita toda entrada dos menus": era vermelho, ficou verde | nada |
| Cada capítulo abre com 3 linhas | teste novo conta as 3 linhas | nada |
| Cada capítulo fecha com "O que ainda não funciona" | teste antigo, verde | nada |
| Links de língua consertados | todos os links `.md` do manual apontam para arquivo que existe | nada |
| Inglês em dia, 00 a 10 | os mesmos testes leem as duas línguas | o 11 não tem inglês |
| Depois da junção: "Ponto/Caixa neste **desenho**" e **Recorte na cena** | os testes do manual pegaram as mudanças da noite. Fiz o Recorte na cena no navegador, só clicando, e tirei a foto | nada |
| Capítulo 11 (de outra sessão) | só acrescentei as 3 linhas do começo | o resto do texto é de quem escreveu |
| PDF | `npm run manual-pdf`: 13 partes, 70 de 70 imagens | nada |
| `manual-pdf.mjs` | agora sobe o editor sozinho, acha o Chromium, e usa perfil novo a cada vez | nada |
| Teste novo: tabela sem cabeçalho | prova com a forma errada escrita dentro do teste: ele pega | ver o defeito abaixo |

## A régua (01h00 UTC)

| Régua | Resultado |
|:---|:---|
| `npx vitest run` | 5.920 passam, **0 vermelho**, 11 pulados (nenhum do manual) |
| `tsc` | limpo |
| `conformidade.mjs` | 132 de 132 |

## Um defeito achado, fora da minha parte

| Onde | O quê | Como aparece |
|:---|:---|:---|
| `editor/src/io/manual.ts`, `renderMarkdown` | uma linha que começa com `\|` sem cabeçalho de tabela faz um laço sem fim | o Ajuda → Manual trava; o PDF morre com "Invalid array length" |

A forma do meu erro: **pus uma foto depois da linha que eu procurava, sem olhar
se a tabela acabava ali.** O texto está consertado, e o teste novo não deixa
voltar. O laço no código continua: é de outra parte.

## Avisos

| Aviso | Para quem |
|:---|:---|
| Os capítulos **03 Skins**, **05 Entidades** e a **biblioteca** do 10 estão certos para o ramo de hoje. Vão mudar com os ramos de tomadas, skins e reaproveitar. **Refazer depois que esses ramos entrarem** | Diretor |
| O `programa/` montado ainda tem o manual velho no F1. Montar de novo no fecho | quem fecha |
| O `ferramentas/provas/fotos-manual.mjs` velho grava fotos com nomes velhos. Se rodar, o teste das imagens fica vermelho. O certo agora é `ferramentas/manual-fotos.mjs` | provas |
| Não rodei `roteiro` nem `medir`: portas fixas, e o programa não mudou neste ramo | Diretor |

## O que não se acha (passos sem porta na tela)

| Passo | Por quê |
|:---|:---|
| Prender o emissor de partículas pela Árvore, ou por `P` + clique | não vi o gesto funcionar no emissor. O manual manda usar **Partículas → Prender ao osso escolhido**, que está na tela |
| Escolher o canal de fundo (`baseAnimation`) | o editor lê do arquivo, mas não há botão. Está no "O que ainda não funciona" do capítulo 5 |
| Clonar uma base com as animações | não há porta. Está no capítulo 2 |

## O percurso clicando (01h10 UTC)

Um script abriu o herói no navegador e, para cada caminho de menu que o manual
cita, **clicou** no menu e nos submenus, como uma pessoa.

| Medida | Número |
|:---|---:|
| Caminhos diferentes citados pelo manual | 152 |
| Achados clicando, e acesos | 119 |
| Achados, mas cinza naquele momento | 33 |
| **Não achados clicando** | **0** |

Os 33 cinzas pedem uma escolha antes (uma entidade, uma malha, um emissor). O
script apertava `Esc` entre um caminho e outro, e o `Esc` também desmarca:
então parte dos cinzas é do script, e não do programa. **Todo cinza tem dica
dizendo o que fazer primeiro**, menos um:

| Item | O que a dica diz | O que falta dizer |
|:---|:---|:---|
| **Editar → Colar espelhado** | o que ele faz | **por que** está cinza (falta copiar uma pose antes) |

## Tarefa nova do Diretor: todo item cinza diz por quê

| O que fiz | Como provei | O que ficou |
|:---|:---|:---|
| Módulo novo `editor/src/ui/porque-apagado.ts`: o motivo fixo, por ação, com o que fazer | — | — |
| `ui/actions.ts`: uma linha. Sem `why` no registro, vale o motivo da tabela. O motivo de agora (`why`) continua vencendo | teste: `actionState` devolve a tabela; o `why` do registro vence | — |
| `ui/shell.ts`: item cinza põe o motivo no rodapé ao passar o mouse | navegador, abaixo | — |
| Teste novo `editor/testes/porque-apagado.test.ts`: varre o código, toda ação com `enabled` tem `why` ou linha na tabela | sem a linha do Colar espelhado, o teste fica vermelho (visto). Antes eram **81 ações mudas** | ações registradas por ajudante (`porta(doc, id)`) não são varridas: as de hoje têm `why` ou nunca apagam |
| No navegador, herói aberto, nada escolhido, mouse em cima de 12 itens cinza | os 12 mostram o motivo **na dica e no rodapé**: Colar espelhado, Colar, Desfazer, Refazer, Os filhos, Copiar posição no osso, Trazer para a frente, Chavear, Tirar o recorte, Chave seguinte do escolhido, Recorte na cena, Esconder esta imagem | — |
| Manual: seção "Item cinza: ele diz por quê" no capítulo 0, com foto, nas duas línguas | teste das imagens, verde | — |

## Decisões que tomei sozinho

| Decisão | Por quê |
|:---|:---|
| Não reescrevi os capítulos do zero | o texto já era da v36.5 (07/10). Conferi contra o código e consertei o que estava errado |
| `ferramentas/manual-fotos.mjs` é arquivo novo | sem ele, as fotos voltam a envelhecer uma a uma |
| Desfiz minha linha em `QUEM E QUEM.md` | ordem do Diretor: ele junta no fim |

FIM
