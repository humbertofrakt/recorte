# O que o programa sabe fazer e não tem botão — 2026-10-05

Gerado por `npm run portas`, às 02:31. **Não escrever à mão:** o
arquivo é lido do código a cada vez, e o que se escrever aqui se perde na
próxima medição. A régua é `editor/src/ui/command-audit.ts`, a mesma do teste.

## Em números

| Medida | Número |
|:---|---:|
| Arquivos de `editor/src` lidos | 199 |
| Coisas que editam o documento | 220 |
| Delas, **sem porta** | 9 |
| Com motivo escrito | 9 |
| **Sem motivo escrito** (o teste fica vermelho) | 0 |

## As que faltam de verdade — falta decidir onde entram

Estas o programa sabe fazer, e **não há botão nenhum** que as chame. O motivo
diz que a porta ainda não foi decidida: quem decide é o Humberto.

| O quê | Onde está | O que faria |
|:---|:---|:---|
| `ImportImagesCommand` | `io/import-images.ts:356` | importar imagens como UM passo de desfazer. Hoje quem importa é o `ImportPsd` (do PSD) e o `setImportedAtlas` solto (da pasta), e o solto não é um comando: não há o que desfazer. Porta ainda não decidida, subida ao Planejador em 21/09 — e é ela que decide se importar imagem entra na pilha de desfazer. |

## As que NÃO precisam de porta, e por quê

| O quê | Onde está | Por que não precisa |
|:---|:---|:---|
| `RemoveBone` | `doc/commands.ts:563` | resto antigo: quem apaga osso hoje é o `DeleteItems` de `panels/tree-commands.ts`, que leva junto o que fica órfão. Este ficou para trás no lote da Árvore, e é de apagar. A escolha de apagar não é minha: subida ao Planejador em 21/09. |
| `RemoveSlot` | `doc/commands.ts:582` | resto antigo, o mesmo que `RemoveBone`: o programa apaga slot pelo `DeleteItems`. |
| `RemoveAnimation` | `doc/commands.ts:598` | resto antigo: a aba Animações apaga pelo `DeleteAnimation` de `panels/animations-model.ts`, que é o que o botão chama. |
| `RenameNode` | `doc/commands.ts:709` | resto antigo: quem renomeia hoje é o `RenameItem` de `panels/rename.ts`, chamado pela Árvore, por Propriedades e pela aba Animações. |
| `ToggleSkinBone` | `panels/skins-model.ts:650` | apelido de `ToggleSkinMember('bones', …)`, que é o usado e tem porta em Propriedades. A subclasse existe pelo nome que o plano da rodada 4 usava. |
| `ToggleSkinConstraint` | `panels/skins-model.ts:655` | apelido de `ToggleSkinMember('constraints', …)`, o mesmo que `ToggleSkinBone`. |
| `removeTimeline` | `anim/keying.ts:1047` | o plural `removeTimelines` de `anim/keying.ts` é o que a linha do tempo chama, e ele faz o mesmo para uma lista. Este singular é o irmão que ficou sem chamador — resto, não função que falta. Fica na lista porque apagá-lo é mexer em `anim/keying.ts`, que em 21/09 é a cerca de outro chat. |
| `attachmentRows` | `panels/tree-rows.ts:238` | NÃO ESCREVE NO ARQUIVO: monta linhas da Árvore numa lista própria e a devolve. O vigia a acusa porque acha um `.push` na base e não sabe dizer se o alvo é o `.bone` ou uma lista de passagem — é o limite desta régua, escrito aqui em vez de escondido num ajuste. Ela é código morto em `panels/tree-rows.ts`, que não é cerca minha: avisado ao Planejador em 21/09. |

## O que esta lista NÃO diz

| Não diz | Por quê |
|:---|:---|
| que um MENU chama o comando | ela prova que algum arquivo do programa o constrói, e nada além. Quem prova o menu é o `hiddenFunctions` ao lado |
| que alguém ACHA a porta | porta que ninguém encontra é porta que não conta, e isso só a mão do Humberto mede |
| que o botão faz o que o nome dele diz | nenhum inventário pega isso. Só alguém usando |

