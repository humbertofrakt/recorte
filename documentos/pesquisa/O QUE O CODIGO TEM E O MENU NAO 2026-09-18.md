# O que o código tem e o menu não — 18/09/2026

Pergunta do Humberto: *"tem coisas que só existem na programação de vocês.
Não dá para fazer no menu."* Medido às 17h de 18/09, só lendo. Nada foi alterado
em `editor/src`.

## Como foi medido

`node ferramentas/provas/codigo-sem-porta.mjs`. Ele parte do `main.ts` — o
programa que abre de verdade — e segue os `import`. O que ninguém alcança, ou
ninguém chama, aparece na lista.

| Medida | Número |
|:---|:---:|
| Arquivos em `editor/src` | 171 |
| Alcançados pelo `main.ts` | 167 |
| Os 4 de fora | só tabelas de teste (`action-audit`, `menu-audit`, `actions-table`, `keying-types`). Normal |

## Confirmado: comando pronto, com teste verde, que o programa NUNCA chama

| Comando | O que faria | Onde está |
|:---|:---|:---|
| `SetRuleChain` | trocar a cadeia de ossos de uma IK **depois** de criada | `panels/rules-model.ts:487` |
| `KeyDriverTarget` | gravar chave de alvo no valor atual do parâmetro | `panels/rules-model.ts:850` |
| `DeleteTag` | apagar uma etiqueta e limpá-la de toda animação | `panels/rules-vars.ts:415` |
| `RenameTag` | renomear uma etiqueta em todo lugar | `panels/rules-vars.ts:451` |
| `removeBodyKey` | tirar a chave de troca de corpo | `anim/body.ts` |
| `ImportImagesCommand` | importar imagens como um comando só | `io/import-images.ts` |

**É a forma que o Humberto descreveu:** o teste passa, o relatório diz "feito",
e não há botão. O teste prova o comando; não prova a porta (regra 28).

## Sobra morta, não função escondida

`RemoveBone`, `RemoveSlot`, `RemoveAnimation`, `RenameNode` (`doc/commands.ts`).
O programa apaga e renomeia por outros comandos (`DeleteItems`, `DeleteAnimation`,
`RenameItem`). Estes são restos antigos. `ToggleSkinBone` e
`ToggleSkinConstraint` são só apelidos do `ToggleSkinMember`, que é usado.

## O que este medidor NÃO vê

| Não vê | Por quê |
|:---|:---|
| Função chamada, mas por um gesto sem porta visível (`Alt`+clique, tecla solta) | ela É chamada; só uma pessoa na tela percebe que não acha |
| Coisa que o plano promete e o código nem tem | não há o que medir |
| Botão que existe mas não faz o que o nome diz | só abrindo o programa |

A auditoria antiga (`ui/action-audit.ts`) só olha **ações registradas**. Um
comando que nunca virou ação passa por baixo dela. É o buraco achado aqui.

## A figura do Spriter (o "3" na mão)

Não confirmei o que o número quer dizer no Spriter. Não afirmo. Fica para
olhar no programa, junto com o Humberto.

## Proposta, para o Humberto decidir

1. Todo lote fecha com **o caminho de cliques** escrito: menu → item → o que acontece. Sem caminho, não está feito.
2. O medidor vira teste: comando sem quem o chame = vermelho, ou uma linha dizendo por quê.
3. Os seis da tabela: ou ganham porta, ou saem.
